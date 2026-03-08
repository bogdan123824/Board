from sqlalchemy.orm import Session
from models import Review, User


def get_reviews_service(db: Session, seller_id: int) -> list:
    return db.query(Review).filter(Review.seller_id == seller_id).all()


def get_my_reviews_service(db: Session, user_id: int) -> list:
    return db.query(Review).filter(Review.seller_id == user_id).all()


def create_review_service(db: Session, author_id: int, seller_id: int, text: str, rating: int) -> Review:
    if author_id == seller_id:
        return None
    
    existing_review = db.query(Review).filter(
        Review.author_id == author_id,
        Review.seller_id == seller_id
    ).first()
    
    if existing_review:
        return None
    
    new_review = Review(
        author_id=author_id,
        seller_id=seller_id,
        text=text,
        rating=rating
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    
    _update_seller_rating(db, seller_id)
    
    return new_review


def _update_seller_rating(db: Session, seller_id: int):
    reviews = db.query(Review).filter(Review.seller_id == seller_id).all()
    
    if not reviews:
        return
    
    avg_rating = sum(r.rating for r in reviews) / len(reviews)
    
    seller = db.query(User).filter(User.id == seller_id).first()
    if seller:
        seller.rating = round(avg_rating, 2)
        seller.reviews_count = len(reviews)
        db.commit()
        db.refresh(seller)
