from sqlalchemy.orm import Session
from models import Dialogue, Message

def get_dialogue(db: Session, user_id: int, other_user_id: int, post_id: int):
    return db.query(Dialogue).filter(
        (
            ((Dialogue.user_from == user_id) & (Dialogue.user_to == other_user_id)) |
            ((Dialogue.user_from == other_user_id) & (Dialogue.user_to == user_id))
        ) & (Dialogue.post_id == post_id)
    ).first()

def create_dialogue(db: Session, dialogue: Dialogue):
    db.add(dialogue)
    db.commit()
    db.refresh(dialogue)
    return dialogue

def create_message(db: Session, message: Message):
    db.add(message)
    db.commit()
    db.refresh(message)
    return message

def get_messages(db: Session, dialogue_id: int):
    return db.query(Message).filter(Message.dialogue_id == dialogue_id).order_by(Message.timestamp.asc()).all()