from fastapi import APIRouter, Depends, Form, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import base64

from database import get_db
from models import User
from schemas import VerificationResponse, VerificationStatus
from utils import get_current_user
from services.verification_service import (
    request_verification_service,
    get_verification_requests_service,
    verify_user_request_service
)
from helpers import check_authorization
from exceptions import BadRequestError, NotFoundError

router = APIRouter(tags=["Verification"])


@router.post("/verification/request")
async def request_verification(
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    files_data = []
    for file in files:
        content = await file.read()
        files_data.append(base64.b64encode(content).decode("utf-8"))
    
    success = request_verification_service(db, current_user, files_data)
    if not success:
        raise BadRequestError("Verification request already submitted")
    return {"detail": "Verification request submitted successfully"}


@router.get("/verification/requests", response_model=List[VerificationResponse])
def get_verification_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_authorization(
        current_user.role in ["Admin", "Owner"],
        "You must be an admin to access this"
    )
    return get_verification_requests_service(db)


@router.put("/verification/requests/{request_id}")
def verify_request(
    request_id: int,
    status: VerificationStatus = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_authorization(
        current_user.role in ["Admin", "Owner"],
        "You must be an admin to access this"
    )
    success = verify_user_request_service(db, request_id, status.value)
    if not success:
        raise NotFoundError("Verification request not found")
    return {"detail": "Verification request processed successfully"}