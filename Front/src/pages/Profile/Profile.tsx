import React, { useState, useEffect } from "react";
import { Spinner } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./Profile.css";

import "bootstrap/dist/css/bootstrap.min.css";

import PageWrapper from "../../components/PageWrapper/PageWrapper";

import AvatarPlaceholder from "../../assets/icons/AvatarPlaceholder.svg?react";
import DarkHexagon from "../../assets/icons/DarkHexagon.svg?react";
import OrangeHexagon from "../../assets/icons/OrangeHexagon.svg?react";

import CreateNotice from "../../components/CreateNoticeTab/CreateNotice";
import MyNotices from "../../components/MyNoticesTab/MyNotices";
import Settings from "../../components/SettingsTab/Settings";
import Verify from "../../components/VerifyTab/Verify";
import ChatView from "../../components/ChatViewTab/ChatView";
import AdminPanel from "../../components/AdminPanel/AdminPanel";
import Rating from "../../components/RatingTab/Rating";

interface UserData {
    id: number;
    name: string;
    surname: string;
    email: string;
    phone: string;
    avatarBase64: string;
    isVerified: string;
    isEmailConfirmed: boolean;
    role: string;
    createdAt: string;
}

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    const [activeTab, setActiveTab] = useState<"my notices" | "chat" | "settings" | "create notice" | "verify" | "admin panel" | "rating">("my notices");

    const API_URL = import.meta.env.VITE_API_URL;

    const token = localStorage.getItem("token");
    useEffect(() => {
        if (!token) {
            navigate("/login");
        }
    }, [token, navigate]);

    useEffect(() => {
        if (location.state) {
            const { tab } = location.state as {
                tab?: "my notices" | "chat" | "settings" | "create notice" | "verify" | "admin panel" | "rating"
            };
            if (tab) setActiveTab(tab);
        }
    }, [location.state]);

    useEffect(() => {
        const fetchUser = async () => {
            if (!token) return;

            try {
                const response = await axios.get(`${API_URL}/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setUser(response.data);
            } catch (error) {
                console.error("Failed to fetch user:", error);
                navigate("/login");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();

        const handleUsernameChange = () => {
            fetchUser();
        };

        window.addEventListener("changedUsernameData", handleUsernameChange);

        return () => {
            window.removeEventListener("changedUsernameData", handleUsernameChange);
        };
    }, [navigate, token]);

    if (!token) return null;

    if (loading) {
        return (
            <PageWrapper>
                <Spinner animation="border" variant="light" />
            </PageWrapper>
        );
    }

    const tabs = [
        { label: "MY NOTICES", key: "my notices" },
        { label: "CHAT", key: "chat" },
        { label: "SETTINGS", key: "settings" },
        user?.isVerified
            ? { label: "CREATE NOTICE", key: "create notice" }
            : { label: "VERIFY", key: "verify" },
        ...(user?.isVerified ? [{ label: "RATING", key: "rating" }] : []),
        ...(user?.role === "Admin" ? [{ label: "ADMIN PANEL", key: "admin panel" }] : [])
    ];

    if (!user) return null;

    return (
        <div className="profile-container">
            {/* Desktop Tabs - Hexagons */}
            <div className="desktop-tabs">
                <div className="profile-header">
                    <div className="info-container">
                        {user.avatarBase64 ? (
                            <div className="avatar-container">
                                <img
                                    src={user.avatarBase64}
                                    alt="Avatar Preview"
                                    className="avatar-image"
                                />
                            </div>
                        ) : (
                            <AvatarPlaceholder width={180} height={180} className="avatar-placeholder" />
                        )}
                        <div className="user-info">
                            <p className="user-name">{user.name} {user.surname}</p>
                            <p className="user-email">{user.email}</p>
                        </div>
                    </div>
                </div>
                {tabs.map(({ label, key }) => {
                    const isActive = activeTab === key;
                    return (
                        <div
                            key={key}
                            onClick={() => setActiveTab(key as "my notices" | "chat" | "settings" | "create notice" | "verify" | "admin panel" | "rating")}
                            className="desktop-tab-item"
                        >
                            {isActive ? (
                                <OrangeHexagon width={180} height={180} className="hexagon" />
                            ) : (
                                <DarkHexagon width={180} height={180} className="hexagon" />
                            )}
                            <p className={`desktop-tab-label ${isActive ? 'active' : ''}`}>
                                {label}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Mobile Tabs - Regular Buttons */}
            <div className="mobile-tabs">
                <div className="mobile-tabs-grid">
                    {tabs.map(({ label, key }) => {
                        const isActive = activeTab === key;
                        return (
                            <button
                                key={key}
                                onClick={() => setActiveTab(key as "my notices" | "chat" | "settings" | "create notice" | "verify" | "admin panel" | "rating")}
                                className={`mobile-tab-button ${isActive ? 'active' : ''}`}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="tab-content">
                {activeTab === "chat" && <ChatView />}
                {activeTab === "my notices" && <MyNotices />}
                {activeTab === "create notice" && <CreateNotice />}
                {activeTab === "settings" && <Settings />}
                {activeTab === "verify" && <Verify />}
                {activeTab === "admin panel" && <AdminPanel />}
                {activeTab === "rating" && <Rating />}
            </div>
        </div>
    );
};

export default ProfilePage;

