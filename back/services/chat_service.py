from sqlalchemy.orm import Session
from datetime import datetime
from models import Dialogue, Message


def get_my_dialogues(db: Session, user_id: int):
    dialogues = db.query(Dialogue).filter(
        (Dialogue.user_from == user_id) | (Dialogue.user_to == user_id)
    ).all()
    return dialogues


def get_dialogue(db: Session, user_id: int, other_user_id: int, post_id: int):
    dialogue = db.query(Dialogue).filter(
        (
            ((Dialogue.user_from == user_id) & (Dialogue.user_to == other_user_id)) |
            ((Dialogue.user_from == other_user_id) & (Dialogue.user_to == user_id))
        ) & (Dialogue.post_id == post_id)
    ).first()
    return dialogue


def create_dialogue(db: Session, user_id: int, other_user_id: int, post_id: int):
    dialogue = Dialogue(
        user_from=user_id,
        user_to=other_user_id,
        post_id=post_id
    )
    db.add(dialogue)
    db.commit()
    db.refresh(dialogue)
    return dialogue


def send_message(db: Session, dialogue: Dialogue, user_id: int, message_text: str):
    message = Message(
        dialogue_id=dialogue.id,
        user_id=user_id,
        message=message_text,
        timestamp=datetime.utcnow()
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return message


def get_messages(db: Session, dialogue_id: int):
    return db.query(Message).filter(Message.dialogue_id == dialogue_id).order_by(Message.timestamp.asc()).all()