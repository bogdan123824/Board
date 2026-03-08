from fastapi import APIRouter, Depends, Form, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import base64

from database import get_db
from models import Post, User
from schemas import PostResponse, CloseReason
from utils import CurrencyEnum, CityEnum, get_current_user
from services.post_service import create_post, get_post, close_post, search_posts
from helpers import check_resource_exists, check_resource_exists_or_forbidden, validate_resource_ownership
from exceptions import NotFoundError, ForbiddenError

router = APIRouter()


@router.get("/posts", tags=["Post"])
def get_posts(db: Session = Depends(get_db)):
    posts = search_posts(db)
    check_resource_exists(posts, "Posts")
    return posts


@router.get("/posts/{post_id}", response_model=PostResponse, tags=["Post"])
def read_post(post_id: int, db: Session = Depends(get_db)):
    post = get_post(db, post_id)
    check_resource_exists(post, "Post")
    return post


@router.post("/posts", tags=["Post"])
async def create_new_post(
    title: str = Form(..., max_length=100),
    caption: str = Form(..., max_length=1000),
    price: int = Form(...),
    tags: str = Form(""),
    category_id: int = Form(...),
    is_used: bool = Form(..., alias="isUsed"),
    currency: CurrencyEnum = Form(...),
    location: CityEnum = Form(...),
    images: List[UploadFile] = File([]),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    image_base64_list = [base64.b64encode(await image.read()).decode("utf-8") for image in images]
    
    tag_list = [t.strip() for t in tags.split(",") if t.strip()]
    
    post_data = {
        "title": title,
        "caption": caption,
        "price": price,
        "tags": tag_list,
        "category_id": category_id,
        "images": image_base64_list,
        "is_used": is_used,
        "currency": currency,
        "location": location
    }
    post = create_post(db, post_data, current_user, image_base64_list, tag_list)
    return post


@router.post("/posts/{post_id}/close", tags=["Post"])
def close_existing_post(
    post_id: int,
    reason: CloseReason = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    post = get_post(db, post_id)
    check_resource_exists_or_forbidden(post, post.user_id if post else None, current_user.id, "Post")
    
    close_post(db, post, reason.value)
    return {"message": f"Post {post_id} closed successfully", "reason": reason.value}