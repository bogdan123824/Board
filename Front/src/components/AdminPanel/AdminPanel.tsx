import React, { useState } from "react";
import UsersWithPosts from "./UsersWithPosts";
import VerificationRequests from "./VerificationRequests";
import Complaints from "./Complaints";

const AdminPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState<"Users" | "Verification" | "Complaints">("Users");

    return (
        <div style={{ width: "100%", color: "white" }}>
            <div
                style={{
                    display: "flex",
                    width: "100%",
                    alignItems: "flex-end",
                    marginBottom: "28px",
                }}
            >
                <p
                    style={{
                        paddingRight: "14px",
                        color: "white",
                        fontSize: "120%",
                        textTransform: "uppercase",
                    }}
                >
                    Admin Panel
                </p>
                <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                    <div style={{ display: "flex", gap: "28px" }}>
                        {["Users", "Verification", "Complaints"].map((tab) => (
                            <div
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                style={{
                                    color: activeTab === tab ? "#D9A441" : "#525252",
                                    cursor: "pointer",
                                    position: "relative",
                                    transition: "color 0.2s",
                                    padding: "0 6px 2px 6px",
                                }}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <div
                                        style={{
                                            position: "absolute",
                                            bottom: 0,
                                            left: 0,
                                            height: "1px",
                                            width: "100%",
                                            backgroundColor: "#E9E9E9",
                                            transition: "all 0.3s ease-in-out",
                                        }}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                    <div style={{ height: "1px", backgroundColor: "#525252" }} />
                </div>
            </div>

            {activeTab === "Users" && <UsersWithPosts />}
            {activeTab === "Verification" && <VerificationRequests />}
            {activeTab === "Complaints" && <Complaints />}
        </div>
    );
};

export default AdminPanel;
