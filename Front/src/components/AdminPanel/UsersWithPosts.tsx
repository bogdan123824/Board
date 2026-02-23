import React, { useEffect, useState } from "react";
import { Button, Modal, Form, Alert } from "react-bootstrap";
import axios from "axios";
import Search from "../../assets/icons/Search.svg?react";
import ButtonRight from "../../assets/icons/ButtonRight.svg?react";
import { useNavigate } from "react-router-dom";

import FullStar from "../../assets/icons/FullStar.svg?react";
import { formatDate } from "../../utils/FormatTime";

interface PostOut {
    id: number;
    title: string;
    caption?: string;
    createdAt?: string;
    views?: number;
}

interface UserWithPosts {
    id: number;
    name: string;
    surname: string;
    phone?: string;
    email: string;
    isVerified: boolean;
    isBlocked: boolean;
    blockReason?: string;
    blockedAt?: string;
    role: string;
    createdAt?: string;
    location?: string;
    rating?: number;
    reviewsCount?: number;
    posts: PostOut[];
}

interface PageButtonProps {
    page: number;
    currentPage: number;
    setCurrentPage: (page: number) => void;
}

const PageButton: React.FC<PageButtonProps> = ({ page, currentPage, setCurrentPage }) => (
    <button
        onClick={() => setCurrentPage(page)}
        style={{
            padding: "4px 8px",
            borderRadius: "4px",
            border: currentPage === page ? "1px solid #D9A441" : "1px solid #444",
            backgroundColor: currentPage === page ? "#D9A441" : "transparent",
            color: currentPage === page ? "#000" : "#fff",
            cursor: "pointer",
        }}
    >
        {page}
    </button>
);

const Dots: React.FC = () => <span style={{ color: "#a6a6a6" }}>...</span>;

const UsersWithPosts: React.FC = () => {
    const navigate = useNavigate();

    const [users, setUsers] = useState<UserWithPosts[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [showBlocked, setShowBlocked] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 10;

    const [selectedUser, setSelectedUser] = useState<UserWithPosts | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [showBlockModal, setShowBlockModal] = useState(false);
    const [blockReason, setBlockReason] = useState("");
    const [blockingUser, setBlockingUser] = useState(false);
    const [blockError, setBlockError] = useState<string | null>(null);
    const [blockSuccess, setBlockSuccess] = useState<string | null>(null);

    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${API_URL}/users-with-posts`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(res.data);
        } catch (err) {
            console.error("Failed to fetch users", err);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(u => {
        const matchesSearch = `${u.name} ${u.surname}`.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesBlocked = showBlocked ? u.isBlocked : true;
        return matchesSearch && matchesBlocked;
    });

    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const currentUsers = filteredUsers.slice(
        (currentPage - 1) * usersPerPage,
        currentPage * usersPerPage
    );

    const openBlockModal = (user: UserWithPosts) => {
        setSelectedUser(user);
        setBlockReason("");
        setBlockError(null);
        setBlockSuccess(null);
        setShowBlockModal(true);
    };

    const closeBlockModal = () => {
        setShowBlockModal(false);
        setSelectedUser(null);
    };

    const sendBlockUser = async () => {
        if (!selectedUser) return;
        setBlockingUser(true);
        try {
            const formData = new FormData();
            formData.append("isBlocked", "true");
            formData.append("blockReason", blockReason || "Blocked by admin");

            await axios.put(
                `${API_URL}/users/block/${selectedUser.id}`,
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setBlockSuccess("User successfully blocked");
            fetchUsers();
            setTimeout(() => closeBlockModal(), 1200);
        } catch (err: any) {
            setBlockError(err.response?.data?.detail || "Failed to block user");
        } finally {
            setBlockingUser(false);
        }
    };

    const unblockUser = async (user: UserWithPosts) => {
        try {
            await axios.put(
                `${API_URL}/users/block/${user.id}`,
                { isBlocked: false, blockReason: null },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchUsers();
        } catch {
            alert("Failed to unblock user");
        }
    };

    return (
        <div>
            {/* Search */}
            <Form.Group style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "1rem" }}>
                <Form.Group controlId="titleInput" style={{ width: "240px" }}>
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter name"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </Form.Group>

                <Form.Group>
                    <Form.Label>Blocked</Form.Label>
                    <Form.Check
                        style={{ width: "41.33px", height: "41.33px", margin: 0 }}
                        type="checkbox"
                        id="showBlocked"
                        checked={showBlocked}
                        onChange={(e) => {
                            setShowBlocked(e.target.checked);
                            setCurrentPage(1);
                        }}
                        className="custom-checkbox"
                    />
                </Form.Group>
            </Form.Group>

            {currentUsers.length === 0 && <p style={{ color: "#a6a6a6" }}>No users found</p>}

            {currentUsers.map((user) => (
                <div
                    key={user.id}
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        padding: "16px",
                        borderRadius: "12px",
                        backgroundColor: "rgb(13, 13, 13)",
                        marginBottom: "12px",
                    }}
                >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                            <p style={{ fontWeight: "bold", fontSize: "1.1rem", color: "#ffffff", margin: 0 }}>
                                <span style={{ fontSize: "0.9rem", color: "#D9A441", margin: 0 }}>{user.role}</span> {user.name} {user.surname}
                            </p>
                            <p style={{ fontSize: "0.85rem", color: "#a6a6a6", display: "flex" }}>{user.email}</p>
                        </div>

                        <div style={{ display: "flex", gap: "8px" }}>
                            {user.isBlocked ? (
                                <Button variant="success" onClick={() => unblockUser(user)}>Unblock</Button>
                            ) : (
                                <Button variant="danger" onClick={() => openBlockModal(user)}>Block</Button>
                            )}
                            <Button onClick={() => { setSelectedUser(user); setIsModalOpen(true); }}>
                                <Search width={18} height={18} />
                            </Button>
                        </div>
                    </div>
                </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        marginTop: "28px",
                        gap: "16px"
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "16px",
                        }}
                    >
                        <button
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            style={{
                                background: "none",
                                border: "none",
                                cursor: currentPage === 1 ? "default" : "pointer",
                                padding: 0,
                                display: "flex",
                                alignItems: "center",
                            }}
                        >
                            <ButtonRight
                                width={50}
                                height={50}
                                style={{ transform: "scaleX(-1)" }}
                            />
                        </button>

                        <div style={{ display: "flex", gap: "8px" }}>
                            <PageButton page={1} currentPage={currentPage} setCurrentPage={setCurrentPage} />

                            {currentPage > 3 && <Dots />}

                            {currentPage > 2 && (
                                <PageButton page={currentPage - 1} currentPage={currentPage} setCurrentPage={setCurrentPage} />
                            )}

                            {currentPage !== 1 && currentPage !== totalPages && (
                                <PageButton page={currentPage} currentPage={currentPage} setCurrentPage={setCurrentPage} />
                            )}

                            {currentPage < totalPages - 1 && (
                                <PageButton page={currentPage + 1} currentPage={currentPage} setCurrentPage={setCurrentPage} />
                            )}

                            {currentPage < totalPages - 2 && <Dots />}

                            {totalPages > 1 && <PageButton page={totalPages} currentPage={currentPage} setCurrentPage={setCurrentPage} />}
                        </div>

                        <button
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            style={{
                                background: "none",
                                border: "none",
                                cursor: currentPage === totalPages ? "default" : "pointer",
                                padding: 0,
                                display: "flex",
                                alignItems: "center",
                            }}
                        >
                            <ButtonRight width={50} height={50} />
                        </button>
                    </div>
                </div>
            )}

            {/* User Details Modal */}
            <Modal show={isModalOpen} onHide={() => setIsModalOpen(false)} centered>
                <Modal.Body style={{ backgroundColor: "#0D0D0D", color: "white", padding: "20px" }}>
                    {selectedUser && (
                        <div>
                            <p style={{ fontWeight: "bold", fontSize: "1.2rem", margin: 0 }}>
                                <span style={{ fontSize: "0.9rem", color: "#D9A441", margin: 0 }}>{selectedUser.role}</span> {selectedUser.name} {selectedUser.surname}
                            </p>

                            {selectedUser.isBlocked && (
                                <p style={{ fontSize: "0.85rem", color: "#D9A441", margin: "2px 0" }}>
                                    Blocked at: {selectedUser.blockedAt ? formatDate(selectedUser.blockedAt) : "N/A"} • Reason: {selectedUser.blockReason || "N/A"}
                                </p>
                            )}

                            <div style={{ fontSize: "0.85rem", color: "#a6a6a6" }}>
                                <p style={{ margin: 0 }}>Email: {selectedUser.email}</p>
                                <p style={{ margin: 0 }}>Phone: {selectedUser.phone || "No phone"}</p>
                            </div>

                            <div style={{ display: "flex", gap: "24px", fontSize: "0.85rem", color: "#a6a6a6" }}>
                                <span>Reviews: {selectedUser.reviewsCount ?? 0}</span>
                                <span>Posts: {selectedUser.posts?.length ?? 0}</span>
                                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                    Rating: {selectedUser.rating ?? "N/A"} <FullStar width={14} height={14} style={{ position: "relative", top: "-1.5px" }} />
                                </span>
                            </div>

                            {selectedUser.posts?.length > 0 && (
                                <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
                                    {selectedUser.posts.map(post => (
                                        <div
                                            key={post.id}
                                            onClick={() => navigate(`/post/${post.id}`)}
                                            style={{ padding: "6px 8px", backgroundColor: "#1A1A1A", borderRadius: "6px", cursor: "pointer" }}
                                        >
                                            <p style={{ margin: 0, fontWeight: "bold" }}>{post.title}</p>
                                            {post.caption && <p style={{ margin: 0, color: "#a6a6a6" }}>{post.caption}</p>}
                                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "70%", color: "#a6a6a6" }}>
                                                <p>Created: {formatDate(post.createdAt!)} </p>
                                                <p>Views: {post.views ?? 0}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </Modal.Body>
            </Modal>

            {/* Block User Modal */}
            <Modal show={showBlockModal} onHide={closeBlockModal} centered>
                <Modal.Body style={{ backgroundColor: "#0D0D0D", color: "white", borderRadius: "5.5px 5.5px 0 0" }}>
                    <Modal.Title>Block User</Modal.Title>
                    {blockError && <Alert variant="danger">{blockError}</Alert>}
                    {blockSuccess && <Alert variant="success">{blockSuccess}</Alert>}
                    <Form.Group controlId="blockReason">
                        <Form.Label style={{ color: "#a6a6a6" }}>Reason for blocking</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={4}
                            value={blockReason}
                            style={{ backgroundColor: "#F2F2F2", height: "80px" }}
                            onChange={(e) => setBlockReason(e.target.value)}
                            disabled={blockingUser || !!blockSuccess}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer style={{ backgroundColor: "#0D0D0D", color: "white", borderTop: "1px solid rgb(23, 25, 27)" }}>
                    <Button variant="danger" onClick={sendBlockUser} disabled={blockingUser || !!blockSuccess}>
                        {blockingUser ? "Blocking..." : "Block"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default UsersWithPosts;
