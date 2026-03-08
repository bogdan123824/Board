from fastapi import APIRouter, Depends, Form
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import User
from schemas import AdminUserResponse, AdminPostResponse
from utils import get_current_user
from services.admin_service import (
    get_all_users_service,
    get_all_posts_service,
    delete_user_service,
    delete_post_service,
    add_category_service,
    delete_category_service
)
from helpers import check_authorization, check_resource_exists
from exceptions import ForbiddenError, NotFoundError, BadRequestError

router = APIRouter(tags=["Admin"])


@router.get("/admin/users", response_model=List[AdminUserResponse])
def get_all_users(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_authorization(current_user.role == "Admin", "You must be an admin to access this")
    return get_all_users_service(db)


@router.get("/admin/posts", response_model=List[AdminPostResponse])
def get_all_posts(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_authorization(current_user.role == "Admin", "You must be an admin to access this")
    return get_all_posts_service(db)


@router.delete("/admin/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_authorization(current_user.role == "Admin", "You must be an admin to access this")
    success = delete_user_service(db, user_id)
    if not success:
        raise NotFoundError("User not found")
    return {"message": f"User {user_id} deleted successfully"}


@router.delete("/admin/posts/{post_id}")
def delete_post(post_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_authorization(current_user.role == "Admin", "You must be an admin to access this")
    success = delete_post_service(db, post_id)
    if not success:
        raise NotFoundError("Post not found")
    return {"message": f"Post {post_id} deleted successfully"}


@router.post("/admin/categories")
def add_category(name: str = Form(..., max_length=50), db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_authorization(current_user.role == "Admin", "You must be an admin to access this")
    category = add_category_service(db, name)
    if not category:
        raise BadRequestError("Category already exists")
    return category


@router.delete("/admin/categories/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    check_authorization(current_user.role == "Admin", "You must be an admin to access this")
    success = delete_category_service(db, category_id)
    if not success:
        raise NotFoundError("Category not found")
    return {"message": f"Category {category_id} deleted successfully"}