from sqlalchemy.orm import Session
from models import VerificationRequest, User


def request_verification_service(db: Session, user: User, files_data: list) -> bool:
    existing = db.query(VerificationRequest).filter(
        VerificationRequest.user_id == user.id
    ).first()
    
    if existing:
        return False
    
    verification_request = VerificationRequest(
        user_id=user.id,
        images=",".join(files_data) if files_data else "",
        status="pending"
    )
    db.add(verification_request)
    db.commit()
    db.refresh(verification_request)
    
    return True


def get_verification_requests_service(db: Session, status: str = None) -> list:
    query = db.query(VerificationRequest)
    
    if status:
        query = query.filter(VerificationRequest.status == status)
    
    return query.all()


def verify_user_request_service(db: Session, request_id: int, status: str) -> bool:
    verification_request = db.query(VerificationRequest).filter(
        VerificationRequest.id == request_id
    ).first()
    
    if not verification_request:
        return False
    
    verification_request.status = status
    
    if status == "approved":
        user = db.query(User).filter(User.id == verification_request.user_id).first()
        if user:
            user.is_verified = True
            db.add(user)
    
    db.add(verification_request)
    db.commit()
    db.refresh(verification_request)
    
    return True
