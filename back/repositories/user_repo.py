from sqlalchemy.orm import Session
from models import User, FavoriteCategory

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def create_user(db: Session, user: User):
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def update_user(db: Session, user: User):
    db.commit()
    db.refresh(user)
    return user

def promote_user_to_admin(db: Session, user_id: int):
    user = get_user_by_id(db, user_id)
    if user:
        user.role = "Admin"
        db.commit()
        db.refresh(user)
        return user
    return None

def block_user(db: Session, user: User, is_blocked: bool, reason: str = None):
    user.isBlocked = is_blocked
    if is_blocked:
        user.blockReason = reason
    else:
        user.blockReason = None
    db.commit()
    db.refresh(user)
    return user

def add_favorite_category(db: Session, user_id: int, category_id: int):
    exists = db.query(FavoriteCategory).filter_by(user_id=user_id, category_id=category_id).first()
    if exists:
        return None
    fav = FavoriteCategory(user_id=user_id, category_id=category_id)
    db.add(fav)
    db.commit()
    db.refresh(fav)
    return fav

def remove_favorite_category(db: Session, user_id: int, category_id: int):
    fav = db.query(FavoriteCategory).filter_by(user_id=user_id, category_id=category_id).first()
    if fav:
        db.delete(fav)
        db.commit()
        return True
    return False