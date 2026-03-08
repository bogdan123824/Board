from sqlalchemy.orm import Session
from models import Post, Category, User

def create_post(db: Session, post: Post):
    db.add(post)
    db.commit()
    db.refresh(post)
    return post

def get_post_by_id(db: Session, post_id: int):
    return db.query(Post).filter(Post.id == post_id, Post.isClosed == False).first()

def close_post(db: Session, post: Post, reason: str):
    post.isClosed = True
    post.closeReason = reason
    db.commit()
    db.refresh(post)
    return post

def search_posts(db: Session, title=None, min_price=None, max_price=None, category_id=None, tags=None):
    query = db.query(Post).filter(Post.isClosed == False)
    if title:
        query = query.filter(Post.title.ilike(f"%{title}%"))
    if min_price is not None:
        query = query.filter(Post.price >= min_price)
    if max_price is not None:
        query = query.filter(Post.price <= max_price)
    if category_id:
        query = query.filter(Post.category_id == category_id)
    if tags:
        tag_list = [t.strip().lower() for t in tags.split(",")]
        for tag in tag_list:
            query = query.filter(Post.tags.ilike(f"%{tag}%"))
    return query.all()