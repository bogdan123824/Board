import React, { useEffect, useState } from "react";
import axios from "axios";
import { Alert, Form, Button, InputGroup, Modal } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import "./ChatView.css";

import SentMessageIcon from "../../assets/icons/SentMessageIcon.svg?react";
import AvatarPlaceholder from "../../assets/icons/AvatarPlaceholder.svg?react";
import Review from "../../assets/icons/Review.svg?react";
import HollowStar from "../../assets/icons/HollowStar.svg?react";
import FullStar from "../../assets/icons/FullStar.svg?react";

const API_URL = import.meta.env.VITE_API_URL;

interface ChatMessage {
    id: number;
    dialogue_id: number;
    user_id: number;
    message: string;
    timestamp: string;
}

interface UserShort {
    id: number;
    nickname: string;
    avatarBase64?: string;
}

interface PostShort {
    id: number;
    title: string;
}

interface Dialogue {
    id: number;
    other_user: UserShort;
    post: PostShort;
    last_message?: string;
    last_message_time?: string;
}

interface DialogueDetailResponse {
    other_user: UserShort;
    post: PostShort;
    messages: ChatMessage[];
}

const ChatView: React.FC = () => {
    const location = useLocation();

    const [dialogs, setDialogs] = useState<Dialogue[]>([]);
    const [selectedChat, setSelectedChat] = useState<{ userId: number; postId: number } | null>(null);
    const [dialogue, setDialogue] = useState<DialogueDetailResponse | null>(null);
    const [newMessage, setNewMessage] = useState("");
    const [error, setError] = useState<string | null>(null);

    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewText, setReviewText] = useState("");
    const [rating, setRating] = useState(3);

    const token = localStorage.getItem("token");

    const fetchChatList = async () => {
        try {
            const res = await axios.get<Dialogue[]>(`${API_URL}/chat/my`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const sortedDialogs = res.data.sort((a, b) => {
                const timeA = a.last_message_time ? new Date(a.last_message_time).getTime() : 0;
                const timeB = b.last_message_time ? new Date(b.last_message_time).getTime() : 0;
                return timeB - timeA;
            });

            setDialogs(sortedDialogs);

            if (
                sortedDialogs.length > 0 &&
                !selectedChat &&
                !(location.state && (location.state as any).userId && (location.state as any).postId)
            ) {
                setSelectedChat({
                    userId: sortedDialogs[0].other_user.id,
                    postId: sortedDialogs[0].post.id,
                });
            }
        } catch {
            setError("Failed to load chat list.");
        }
    };

    useEffect(() => {
        if (location.state && (location.state as any).userId && (location.state as any).postId) {
            const { userId, postId } = location.state as { userId: number; postId: number };
            setSelectedChat({ userId, postId });
        }
    }, [location.state]);

    const fetchMessages = async (userId: number, postId: number) => {
        try {
            const res = await axios.get<DialogueDetailResponse>(`${API_URL}/chat/with/${userId}?post_id=${postId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setDialogue(res.data);
        } catch {
            setError("Failed to load chat.");
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedChat) return;

        try {
            const res = await axios.post(
                `${API_URL}/chat/send`,
                {
                    other_user_id: selectedChat.userId,
                    post_id: selectedChat.postId,
                    message: newMessage,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (dialogue) {
                setDialogue({
                    ...dialogue,
                    messages: [
                        ...dialogue.messages,
                        {
                            id: res.data.message_id || Date.now(),
                            dialogue_id: 0,
                            user_id: Number(localStorage.getItem("userId")),
                            message: newMessage,
                            timestamp: new Date().toISOString(),
                        },
                    ],
                });
            }

            setNewMessage("");
        } catch {
            alert("Failed to send message");
        }
    };

    const sendReview = async () => {
        if (!reviewText.trim() || rating === 0 || !selectedChat) return;

        try {
            const formData = new FormData();
            formData.append("sellerId", String(selectedChat.userId));
            formData.append("text", reviewText);
            formData.append("rating", String(rating));

            await axios.post(`${API_URL}/reviews`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            setReviewText("");
            setRating(0);
            setShowReviewModal(false);
        } catch (err: any) {
            console.error(err.response?.data || err.message);
            alert("Failed to submit review");
        }
    };

    useEffect(() => {
        fetchChatList();
    }, []);

    useEffect(() => {
        if (selectedChat) {
            fetchMessages(selectedChat.userId, selectedChat.postId);
        }
    }, [selectedChat]);

    if (error) return <Alert variant="danger">{error}</Alert>;

    return (
        <div className="chat-container">
            <div className="chats-list">
                {dialogs.length === 0 ? (
                    <p className="no-chats">No chats found.</p>
                ) : (
                    dialogs.map((dialog) => (
                        <div
                            key={dialog.id}
                            className={`chat-item ${dialog.post.title === "Deleted post" ? 'disabled' : ''}`}
                            onClick={() => {
                                if (dialog.post.title !== "Deleted post") {
                                    setSelectedChat({ userId: dialog.other_user.id, postId: dialog.post.id });
                                }
                            }}
                        >
                            {dialog.other_user.avatarBase64 ? (
                                <div className="chat-avatar">
                                    <img
                                        src={dialog.other_user.avatarBase64}
                                        alt="Avatar"
                                        className="avatar-image"
                                    />
                                </div>
                            ) : (
                                <AvatarPlaceholder width={60} height={60} className="avatar-placeholder" />
                            )}

                            <div className="chat-info">
                                <div className="chat-header">
                                    <span className="chat-username">{dialog.other_user.nickname}</span>
                                    <small className="chat-time">
                                        {dialog.last_message_time ? new Date(dialog.last_message_time).toLocaleString() : ""}
                                    </small>
                                </div>

                                <p className="chat-preview">
                                    {dialog.last_message && dialog.last_message.length > 100
                                        ? dialog.last_message.slice(0, 100) + "..."
                                        : dialog.last_message || "No messages yet"}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {selectedChat && dialogue && (
                <div className="chat-dialog">
                    <div className="chat-header-bar">
                        <p className="chat-title">
                            Chat with <span className="highlight">{dialogue.other_user.nickname}</span> about {" "}
                            <span className="highlight">{dialogue.post.title}</span>
                        </p>
                        <Button type="button" variant="success" onClick={() => setShowReviewModal(true)} className="review-btn">
                            <Review width={22} height={22} />
                        </Button>
                    </div>

                    <div className="messages-container">
                        {dialogue.messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`message ${msg.user_id === dialogue.other_user.id ? 'received' : 'sent'}`}
                            >
                                {msg.user_id !== dialogue.other_user.id && (
                                    <div className="message-time">
                                        {new Date(msg.timestamp).toLocaleString()}
                                    </div>
                                )}
                                <div className="message-bubble">
                                    {msg.message}
                                </div>
                                {msg.user_id === dialogue.other_user.id && (
                                    <div className="message-time">
                                        {new Date(msg.timestamp).toLocaleString()}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="message-input-container">
                        <Form
                            onSubmit={(e) => {
                                e.preventDefault();
                                sendMessage();
                            }}
                        >
                            <InputGroup>
                                <Form.Control
                                    type="text"
                                    placeholder="Type a message"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    className="message-input"
                                />
                                <Button type="submit" variant="success" className="send-btn">
                                    <SentMessageIcon width={22} height={22} />
                                </Button>
                            </InputGroup>
                        </Form>
                    </div>
                </div>
            )}

            {/* Review Modal */}
            <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)} centered className="review-modal">
                <Modal.Body>
                    <Modal.Title>Leave a Review</Modal.Title>
                    <p className="review-description">
                        Your review helps other users understand how reliable and trustworthy this person is.
                        Please share your experience and rate your communication.
                    </p>
                    <div className="rating-stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <div key={star} onClick={() => setRating(star)} className="star">
                                {star <= rating ? <FullStar width={28} height={28} /> : <HollowStar width={28} height={28} />}
                            </div>
                        ))}
                    </div>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Write your review..."
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        className="review-textarea"
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowReviewModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="success" onClick={sendReview}>
                        Submit Review
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ChatView;