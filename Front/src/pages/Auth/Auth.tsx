import React, { useState, useEffect } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";

import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFaceSadTear, faFaceLaugh } from "@fortawesome/free-solid-svg-icons";

const AuthPage: React.FC = () => {
    const navigate = useNavigate();

    const [isLogin, setIsLogin] = useState(true);
    const [isForgotPassword, setIsForgotPassword] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [phone, setPhone] = useState("");

    const [message, setMessage] = useState<{
        text: string;
        variant: string;
        icon?: any;
    } | null>(null);
    const [isFadingOut, setIsFadingOut] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (isForgotPassword) {
                await axios.post(`${API_URL}/forgot-password`, { email });

                setMessage({
                    text: "If this email exists, instructions have been sent.",
                    variant: "success",
                    icon: faFaceLaugh,
                });

                setEmail("");
                setIsForgotPassword(false);
                return;
            }

            if (isLogin) {
                const formData = new URLSearchParams();
                formData.append("username", email);
                formData.append("password", password);

                const response = await axios.post(`${API_URL}/login`, formData, {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                });

                localStorage.setItem("token", response.data.access_token);
                localStorage.setItem("username", email);

                window.dispatchEvent(new Event("loggedIn"));

                navigate("/profile");
            } else {
                await axios.post(`${API_URL}/register`, {
                    name,
                    surname,
                    phone,
                    email,
                    password,
                });

                setMessage({
                    text: "Successfully registered! Please confirm your email.",
                    variant: "success",
                    icon: faFaceLaugh,
                });

                setIsLogin(true);
            }

            setEmail("");
            setPassword("");
            setName("");
            setSurname("");
            setPhone("");
        } catch (error: any) {
            console.error(error);

            let errorText = isLogin ? "Login failed." : "Registration failed.";

            if (
                isLogin &&
                error.response?.status === 403 &&
                typeof error.response.data.detail === "string"
            ) {
                errorText = error.response.data.detail;
            }

            setMessage({
                text: errorText,
                variant: "danger",
                icon: faFaceSadTear,
            });
        }
    };

    useEffect(() => {
        if (message) {
            const fadeOutTimer = setTimeout(() => setIsFadingOut(true), 3000);
            const removeMessageTimer = setTimeout(() => {
                setMessage(null);
                setIsFadingOut(false);
            }, 4000);
            return () => {
                clearTimeout(fadeOutTimer);
                clearTimeout(removeMessageTimer);
            };
        }
    }, [message]);

    return (
        <Form onSubmit={handleSubmit} style={{ width: "300px", marginTop: "32px" }}>
            {!isLogin && !isForgotPassword && (
                <>
                    <Form.Group className="mb-3">
                        <Form.Control
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Control
                            placeholder="Surname"
                            value={surname}
                            onChange={(e) => setSurname(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Control
                            placeholder="Phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                        />
                    </Form.Group>
                </>
            )}

            <Form.Group className="mb-3">
                <Form.Control
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </Form.Group>

            {!isForgotPassword && (
                <Form.Group className="mb-3">
                    <Form.Control
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required={isLogin || !isLogin}
                    />
                </Form.Group>
            )}

            <Button className="w-100" variant="dark" type="submit">
                {isForgotPassword
                    ? "Send reset link"
                    : isLogin
                        ? "Log in"
                        : "Register"}
            </Button>

            {message && (
                <Alert
                    style={{
                        opacity: isFadingOut ? 0 : 1,
                        maxHeight: isFadingOut ? 0 : "100px",
                        padding: isFadingOut ? "0" : "8px",
                        marginTop: isFadingOut ? "0" : "16px",
                        marginBottom: 0,
                        overflow: "hidden",
                        textAlign: "center",
                        transition:
                            "opacity 1s, max-height 1s ease, padding 1s ease, margin 1.5s ease",
                        backgroundColor:
                            message.variant === "success"
                                ? "rgb(40, 167, 69)"
                                : "rgb(220, 53, 69)",
                        color: "white",
                        border: "1px solid rgb(33, 37, 41)",
                    }}
                >
                    {message.icon && (
                        <FontAwesomeIcon icon={message.icon} style={{ marginRight: 6 }} />
                    )}
                    {message.text}
                </Alert>
            )}

            {!isForgotPassword && (
                <p style={{ color: "grey", textAlign: "center", marginTop: "12px" }}>
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <span
                        style={{
                            color: "#D9A441",
                            cursor: "pointer",
                        }}
                        onClick={() => setIsLogin(!isLogin)}
                    >
                        {isLogin ? "Register!" : "Log in!"}
                    </span>
                </p>
            )}

            {isLogin && !isForgotPassword && (
                <p
                    style={{ 
                        color: "#D9A441", 
                        textAlign: "center", 
                        cursor: "pointer" 
                    }}
                    onClick={() => setIsForgotPassword(true)}
                >
                    Forgot password?
                </p>
            )}

            {isForgotPassword && (
                <p
                    style={{ 
                        color: "#D9A441", 
                        textAlign: "center", 
                        cursor: "pointer",
                        marginTop: "12px"
                    }}
                    onClick={() => setIsForgotPassword(false)}
                >
                    Back to login
                </p>
            )}
        </Form>
    );
};

export default AuthPage;
