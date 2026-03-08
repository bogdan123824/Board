from fastapi import APIRouter, Depends, Form
from sqlalchemy.orm import Session
from utils import get_current_user
from services.user_service import register_user, login_user, add_favorite_category, remove_favorite_category
from database import get_db
from schemas import Token, UserCreate
from exceptions import BadRequestError, NotFoundError

router = APIRouter()


@router.post("/register", response_model=Token, tags=["User"])
def register(user: UserCreate, db: Session = Depends(get_db)):
    token, result = register_user(db, user.dict())
    if result is None and token is None:
        raise BadRequestError("Email is already registered")
    return {"access_token": token, "token_type": "bearer"}


@router.post("/login", response_model=Token, tags=["User"])
def login(email: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    token, user = login_user(db, email, password)
    if user is None:
        raise BadRequestError("Invalid credentials or email not confirmed")
    return {"access_token": token, "token_type": "bearer"}


@router.post("/categories/favorite/{category_id}", tags=["User"])
def add_favorite(category_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    success = add_favorite_category(db, current_user.id, category_id)
    if not success:
        raise BadRequestError("Category already in favorites")
    return {"message": "Category added to favorites"}


@router.delete("/categories/favorite/{category_id}", tags=["User"])
def remove_favorite(category_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    success = remove_favorite_category(db, current_user.id, category_id)
    if not success:
        raise NotFoundError("Category not in favorites")
    return {"message": "Category removed from favorites"}