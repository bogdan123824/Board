import React, { useEffect, useState } from "react";
import { Button, Modal, Carousel } from "react-bootstrap";
import axios from "axios";

import Search from "../../assets/icons/Search.svg?react";
import ButtonRight from "../../assets/icons/ButtonRight.svg?react";
import { formatDate } from "../../utils/FormatTime";

interface VerificationRequest {
    id: number;
    user_id: number;
    email: string;
    name: string;
    surname: string;
    avatarBase64?: string;
    phone?: string;
    images: string[];
    status: string;
    created_at: string;
}

const VerificationRequests: React.FC = () => {
    const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
    const [selectedVerificationRequest, setSelectedVerificationRequest] = useState<VerificationRequest | null>(null);
    const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");

    const fetchVerificationRequests = async () => {
        try {
            const res = await axios.get(`${API_URL}/verification/requests`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVerificationRequests(res.data);
        } catch (err) {
            console.error("Failed to load verification requests", err);
        }
    };

    useEffect(() => {
        fetchVerificationRequests();
    }, []);

    const closeVerificationModal = () => {
        setIsVerificationModalOpen(false);
        setTimeout(() => {
            setSelectedVerificationRequest(null);
            setActiveIndex(0);
        }, 300);
    };

    const respondVerification = async (requestId: number, approve: boolean) => {
        try {
            const formData = new FormData();
            formData.append("status", approve ? "approved" : "rejected");

            await axios.put(
                `${API_URL}/verification/requests/${requestId}`,
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            fetchVerificationRequests();
            closeVerificationModal();
        } catch (e) {
            alert("Failed to update verification request");
        }
    };

    return (
        <div>
            {verificationRequests.length === 0 && <p style={{ color: "#a6a6a6" }}>No pending requests</p>}
            {verificationRequests.map((req) => (
                <div
                    key={req.id}
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "16px",
                        borderRadius: "12px",
                        backgroundColor: "rgb(13, 13, 13)",
                        marginBottom: "12px",
                    }}
                >
                    <div>
                        <p style={{ fontWeight: "bold", fontSize: "1.1rem", color: "#ffffff", margin: 0 }}>
                            <span style={{ fontSize: "0.9rem", color: "#D9A441", margin: 0 }}>From</span> {req.name} {req.surname}
                        </p>
                        <p style={{ fontSize: "0.85rem", color: "#a6a6a6", margin: 0 }}>{req.email}</p>
                    </div>

                    <Button
                        onClick={() => {
                            setSelectedVerificationRequest(req);
                            setIsVerificationModalOpen(true);
                            setActiveIndex(0);
                        }}
                    >
                        <Search width={18} height={18} />
                    </Button>
                </div>
            ))}

            {/* Verification Modal */}
            <Modal show={isVerificationModalOpen} onHide={closeVerificationModal} centered>
                <Modal.Body style={{ backgroundColor: "#0D0D0D", color: "white", padding: "20px" }}>
                    {selectedVerificationRequest && (
                        <div>
                            <p style={{ fontWeight: "bold", fontSize: "1.2rem", margin: 0 }}>
                                <span style={{ fontSize: "0.9rem", color: "#D9A441", margin: 0 }}>From</span> {selectedVerificationRequest.name} {selectedVerificationRequest.surname}
                            </p>

                            <div style={{ fontSize: "0.85rem", color: "#a6a6a6" }}>
                                <p style={{ margin: 0 }}>Email: {selectedVerificationRequest.email}</p>
                                <p style={{ margin: 0 }}>Phone: {selectedVerificationRequest.phone || "No phone"}</p>
                            </div>

                            {/* Created at */}
                            <p style={{ fontSize: "0.8rem", color: "#a6a6a6", marginBottom: "1rem" }}>
                                Submitted {selectedVerificationRequest.created_at ? formatDate(selectedVerificationRequest.created_at) : "N/A"}
                            </p>

                            {/* Carousel */}
                            {selectedVerificationRequest.images.length > 0 && (
                                <Carousel
                                    activeIndex={activeIndex}
                                    onSelect={(i) => setActiveIndex(i)}
                                    prevIcon={<span style={{ transform: "scaleX(-1)" }}><ButtonRight width={60} height={60} /></span>}
                                    nextIcon={<span style={{ position: "relative", left: "20px" }}><ButtonRight width={60} height={60} /></span>}
                                >
                                    {selectedVerificationRequest.images.map((imgBase64, idx) => (
                                        <Carousel.Item key={idx}>
                                            <div style={{ height: "350px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                <img src={`data:image/png;base64,${imgBase64}`} style={{ height: "100%", objectFit: "cover" }} />
                                            </div>
                                        </Carousel.Item>
                                    ))}
                                </Carousel>
                            )}
                        </div>
                    )}
                </Modal.Body>

                <Modal.Footer
                    style={{
                        backgroundColor: "#0D0D0D",
                        color: "white",
                        borderTop: "1px solid rgb(23, 25, 27)",
                    }}
                >
                    <Button onClick={() => respondVerification(selectedVerificationRequest!.id, true)}>Approve</Button>
                    <Button onClick={() => respondVerification(selectedVerificationRequest!.id, false)}>Reject</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default VerificationRequests;
