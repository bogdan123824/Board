from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import User, Post
from schemas import DialogueSummaryResponse, DialogueDetailResponse, UserShortResponse, PostShortResponse, MessageResponse, SendMessageRequest, SendMessageResponse
from utils import get_current_user
from services.chat_service import (
    get_dialogue,
    create_dialogue,
    send_message,
    get_messages,
    get_my_dialogues
)
from helpers import check_resource_exists
from exceptions import BadRequestError

router = APIRouter(tags=["Chat"])


@router.get("/chat/my", response_model=List[DialogueSummaryResponse])
def get_my_chats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    dialogues = get_my_dialogues(db, current_user.id)
    return dialogues


@router.get("/chat/with/{other_user_id}", response_model=DialogueDetailResponse)
def get_conversation(
    other_user_id: int,
    post_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if other_user_id == current_user.id:
        raise BadRequestError("Cannot chat with yourself")

    dialogue = get_dialogue(db, current_user.id, other_user_id, post_id)
    if not dialogue:
        dialogue = create_dialogue(db, current_user.id, other_user_id, post_id)

    messages = get_messages(db, dialogue.id)
    other_user = dialogue.user_from_rel if dialogue.user_to == current_user.id else dialogue.user_to_rel
    post = db.query(Post).filter(Post.id == dialogue.post_id).first()

    return DialogueDetailResponse(
        other_user=UserShortResponse(
            id=other_user.id,
            nickname=f"{other_user.name} {other_user.surname}"
        ),
        post=PostShortResponse(
            id=post.id if post else post_id,
            title=post.title if post else "Deleted post"
        ),
        messages=[MessageResponse(
            id=m.id,
            dialogue_id=m.dialogue_id,
            user_id=m.user_id,
            message=m.message,
            timestamp=m.timestamp
        ) for m in messages]
    )


@router.post("/chat/send", response_model=SendMessageResponse)
def send_chat_message(
    request: SendMessageRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    dialogue = get_dialogue(db, current_user.id, request.other_user_id, request.post_id)
    if not dialogue:
        dialogue = create_dialogue(db, current_user.id, request.other_user_id, request.post_id)
    message = send_message(db, dialogue, current_user.id, request.message)
    return SendMessageResponse(success=True, message_id=message.id)