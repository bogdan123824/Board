from fastapi import APIRouter, Depends, Form
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import User
from schemas import ReviewResponse, RatingEnum
from utils import get_current_user
from services.review_service import get_reviews_service, get_my_reviews_service, create_review_service
from helpers import check_resource_exists
from exceptions import BadRequestError

router = APIRouter(tags=["Reviews"])


@router.get("/reviews/{seller_id}", response_model=List[ReviewResponse])
def get_reviews(seller_id: int, db: Session = Depends(get_db)):
    reviews = get_reviews_service(db, seller_id)
    check_resource_exists(reviews, "Reviews")
    return reviews


@router.get("/my/reviews", response_model=List[ReviewResponse])
def get_my_reviews(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    reviews = get_my_reviews_service(db, current_user.id)
    check_resource_exists(reviews, "Reviews")
    return reviews


@router.post("/reviews", response_model=ReviewResponse)
def create_review(
    seller_id: int = Form(..., alias="sellerId"),
    text: str = Form(...),
    rating: RatingEnum = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    review = create_review_service(db, current_user.id, seller_id, text, rating.value)
    if not review:
        raise BadRequestError("Cannot leave review (self-review or already exists)")
    return review