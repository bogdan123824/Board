from sqlalchemy.orm import Session
from models import User, Post, Category


def get_all_users_service(db: Session) -> list:
    return db.query(User).all()


def get_all_posts_service(db: Session) -> list:
    return db.query(Post).all()


def delete_user_service(db: Session, user_id: int) -> bool:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return False
    
    db.delete(user)
    db.commit()
    return True


def delete_post_service(db: Session, post_id: int) -> bool:
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        return False
    
    db.delete(post)
    db.commit()
    return True


def add_category_service(db: Session, name: str) -> Category:
    existing = db.query(Category).filter(Category.name == name).first()
    if existing:
        return None
    
    category = Category(name=name)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


def delete_category_service(db: Session, category_id: int) -> bool:
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        return False
    
    db.delete(category)
    db.commit()
    return True
