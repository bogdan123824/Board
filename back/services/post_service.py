from sqlalchemy.orm import Session
from models import Post, Category, User, FavoriteCategory
from utils import safe_load_images, safe_load_tags, send_new_post_email

def create_post(db: Session, post_data: dict, current_user: User, image_base64_list: list, tag_list: list):
    new_post = Post(**post_data, userId=current_user.id)
    db.add(new_post)
    db.commit()
    db.refresh(new_post)

    fav_users = (
        db.query(User)
        .join(FavoriteCategory, FavoriteCategory.user_id == User.id)
        .filter(FavoriteCategory.category_id == new_post.category_id)
        .filter(User.isEmailConfirmed == True)
        .all()
    )
    for user in fav_users:
        send_new_post_email(user.email, new_post)

    new_post.tags = safe_load_tags(new_post.tags)
    new_post.images = safe_load_images(new_post.images)
    return new_post

def get_post(db: Session, post_id: int):
    post = db.query(Post).filter(Post.id == post_id, Post.isClosed == False).first()
    if post:
        post.views = (post.views or 0) + 1
        db.add(post)
        db.commit()
        db.refresh(post)
    return post

def close_post(db: Session, post: Post, reason: str):
    post.isClosed = True
    post.closeReason = reason
    db.commit()
    return post

def search_posts(db: Session, title=None, min_price=None, max_price=None, category_name=None, tags=None):
    query = db.query(Post).filter(Post.isClosed == False)
    if title:
        query = query.filter(Post.title.ilike(f"%{title}%"))
    if min_price is not None:
        query = query.filter(Post.price >= min_price)
    if max_price is not None:
        query = query.filter(Post.price <= max_price)
    if category_name:
        category = db.query(Category).filter(Category.name.ilike(category_name)).first()
        if category:
            query = query.filter(Post.category_id == category.id)
        else:
            return []
    if tags:
        tag_list = [tag.strip().lower() for tag in tags.split(",")]
        for tag in tag_list:
            query = query.filter(Post.tags.ilike(f"%{tag}%"))
    results = query.all()
    for post in results:
        post.images = safe_load_images(post.images)
        post.tags = safe_load_tags(post.tags)
    return results