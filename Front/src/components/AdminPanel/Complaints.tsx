import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import Search from "../../assets/icons/Search.svg?react";
import { formatDate } from "../../utils/FormatTime";

interface Complaint {
    id: number;
    post_id?: number;
    message: string;
    created_at: string;
    complained_post_title?: string;
}

const Complaints: React.FC = () => {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const navigate = useNavigate();

    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");

    const fetchComplaints = async () => {
        try {
            const res = await axios.get(`${API_URL}/complaints`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setComplaints(res.data);
        } catch (err) {
            console.error("Failed to load complaints", err);
        }
    };

    useEffect(() => {
        fetchComplaints();
    }, []);

    return (
        <div style={{ maxHeight: "80vh", overflowY: "auto" }}>
            {complaints.length === 0 && <p style={{ color: "#a6a6a6" }}>No complaints</p>}

            {complaints.map((c) => (
                <div
                    key={c.id}
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        padding: "16px",
                        borderRadius: "12px",
                        backgroundColor: "rgb(13, 13, 13)",
                        marginBottom: "12px",
                        gap: "12px",
                    }}
                >
                    <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: "bold", fontSize: "1.1rem", color: "#ffffff", margin: 0 }}>
                            <span style={{ fontSize: "0.85rem", color: "#D9A441", marginRight: "8px" }}>About post:</span>
                            {c.complained_post_title}
                        </p>

                        <div
                            style={{
                                backgroundColor: "#D9A441",
                                padding: "8px 12px",
                                borderRadius: "6px",
                                marginTop: "8px",
                                color: "#0D0D0D",
                                display: "inline-block"
                            }}
                        >
                            {c.message}
                        </div>

                        <p style={{ color: "#a6a6a6", fontSize: "0.8rem", marginTop: "4px" }}>
                            Submitted {formatDate(c.created_at)}
                        </p>
                    </div>

                    <Button
                        onClick={() => c.post_id && navigate(`/post/${c.post_id}`)}
                        style={{ flexShrink: 0 }}
                    >
                        <Search width={18} height={18} />
                    </Button>
                </div>
            ))}
        </div>
    );
};

export default Complaints;
