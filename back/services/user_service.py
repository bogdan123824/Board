from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta

from models import User, FavoriteCategory
from utils import hash_password, verify_password, create_access_token, send_verification_email, send_password_reset_email
from config import SECRET_KEY, ALGORITHM

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def register_user(db: Session, user_data: dict):
    existing_user = db.query(User).filter_by(email=user_data["email"]).first()
    if existing_user:
        if existing_user.isEmailConfirmed:
            return None, "Email is already registered!"
        else:
            token = create_access_token({"sub": existing_user.email})
            send_verification_email(existing_user.email, token)
            return token, None

    hashed_pw = hash_password(user_data.pop("password"))
    user = User(**user_data, password=hashed_pw)
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.email})
    send_verification_email(user.email, token)

    return token, user

def login_user(db: Session, email: str, password: str):
    user = db.query(User).filter_by(email=email).first()
    if not user or not verify_password(password, user.password):
        return None, "Invalid credentials"
    if not user.isEmailConfirmed:
        return None, "Email not confirmed"
    if user.isBlocked:
        return None, f"User is blocked. Reason: {user.blockReason or 'not specified'}"
    token = create_access_token({"sub": user.email, "role": user.role})
    return token, user

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter_by(email=email).first()

def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter_by(id=user_id).first()

def promote_user_to_admin(db: Session, user_id: int):
    user = db.query(User).filter_by(id=user_id).first()
    if user:
        user.role = "Admin"
        db.commit()
        return user
    return None

def block_user(db: Session, user: User, is_blocked: bool, reason: str = None):
    user.isBlocked = is_blocked
    if is_blocked:
        user.blockReason = reason
        user.blockedAt = datetime.utcnow()
    else:
        user.blockReason = None
        user.blockedAt = None
    db.commit()
    return user

def add_favorite_category(db: Session, user_id: int, category_id: int):
    exists = db.query(FavoriteCategory).filter_by(user_id=user_id, category_id=category_id).first()
    if exists:
        return False
    fav = FavoriteCategory(user_id=user_id, category_id=category_id)
    db.add(fav)
    db.commit()
    return True

def remove_favorite_category(db: Session, user_id: int, category_id: int):
    fav = db.query(FavoriteCategory).filter_by(user_id=user_id, category_id=category_id).first()
    if not fav:
        return False
    db.delete(fav)
    db.commit()
    return True

def forgot_password(db: Session, email: str):
    user = db.query(User).filter_by(email=email).first()
    if user:
        token = create_access_token({"sub": user.email}, expires_delta=timedelta(hours=1))
        send_password_reset_email(user.email, token)
    return True