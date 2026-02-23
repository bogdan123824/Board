import React, { useState, useEffect } from "react";
import { Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./MyNotices.css"

import "bootstrap/dist/css/bootstrap.min.css";

import ButtonRight from "../../assets/icons/ButtonRight.svg?react";
import { formatDate } from "../../utils/FormatTime";

interface Post {
    id: number;
    title: string;
    caption: string;
    price: number;
    images: string;
    tags: string;
    views: number;
    isPromoted: boolean;
    createdAt: string;
    userId: number;
    isClosed: boolean;
    closeReason: string;
    category_id: number;
}

type PageButtonProps = {
    page: number;
    currentPage: number;
    setCurrentPage: (page: number) => void;
};

const PageButton: React.FC<PageButtonProps> = ({ page, currentPage, setCurrentPage }) => (
    <button
        onClick={() => setCurrentPage(page)}
        style={{
            width: "40px",
            height: "40px",
            backgroundColor: page === currentPage ? "#D9A441" : "#0D0D0D",
            color: "white",
            border: page === currentPage ? "none" : "2px solid #D9A441",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: "pointer"
        }}
    >
        {page}
    </button>
);

const Dots = () => (
    <span
        style={{
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            border: "2px solid #D9A441",
            borderRadius: "8px"
        }}
    >
        ...
    </span>
);

const Notices: React.FC = () => {
    const navigate = useNavigate();

    const [posts, setPosts] = useState<Post[]>([]);
    const [loadingPosts, setLoadingPosts] = useState(false);

    const [activeTab, setActiveTab] = useState<string>('All');

    const [currentPage, setCurrentPage] = useState<number>(1);
    const postsPerPage = 6;

    const API_URL = import.meta.env.VITE_API_URL;

    const loadMyPosts = async () => {
        setLoadingPosts(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setPosts([]);
                setLoadingPosts(false);
                return;
            }
            const res = await axios.get<Post[]>(`${API_URL}/my/posts`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const postsWithSerializedImages = res.data.map(post => ({
                ...post,
                images: JSON.stringify(post.images ?? []),
            }));

            setPosts(postsWithSerializedImages);
        } catch (err) {
            console.error("Error loading my posts:", err);
            setPosts([]);
        } finally {
            setLoadingPosts(false);
        }
    };

    useEffect(() => {
        loadMyPosts();
    }, []);

    const getImageUrls = (images: string): string[] => {
        try {
            const parsed = JSON.parse(images);
            if (Array.isArray(parsed)) {
                return parsed.map((imgBase64: string) =>
                    imgBase64.startsWith("data:") ? imgBase64 : `data:image/jpeg;base64,${imgBase64}`
                );
            }
            return [];
        } catch {
            return [];
        }
    };

    const getFilteredPosts = (): Post[] => {
        switch (activeTab) {
            case "Popular":
                return [...posts]
                    .sort((a, b) => b.views - a.views)
            case "New":
                return [...posts].sort(
                    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
            case "Cheapest":
                return [...posts].sort((a, b) => a.price - b.price);
            case "Expensive":
                return [...posts].sort((a, b) => b.price - a.price);
            default:
                return posts;
        }
    };

    const filteredPosts = getFilteredPosts();
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
    const currentPosts = filteredPosts.slice(
        (currentPage - 1) * postsPerPage,
        currentPage * postsPerPage
    );

    return (
        <div className="my-notices-container">
            <div className="notices-header">
                <p className="notices-title">My Notices</p>
                <div className="tabs-container">
                    <div className="tabs">
                        {["All", "Popular", "New", "Cheapest", "Expensive"].map((tab) => (
                            <div
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`tab ${activeTab === tab ? 'active' : ''}`}
                            >
                                {tab}
                                {activeTab === tab && <div className="tab-indicator" />}
                            </div>
                        ))}
                    </div>
                    <div className="tab-line" />
                </div>
            </div>

            {loadingPosts ? (
                <div className="loading-container">
                    <Spinner animation="border" variant="light" />
                </div>
            ) : posts.length === 0 ? (
                <p className="no-notices">You don't have any notices.</p>
            ) : (
                <>
                    <div className="notices-list">
                        {currentPosts.map((post) => {
                            const images = getImageUrls(post.images);
                            return (
                                <div key={post.id} className="notice-item">
                                    <div
                                        onClick={() => {
                                            if (!post.isClosed) navigate(`/post/${post.id}`);
                                        }}
                                        className={`notice-card ${post.isClosed ? 'closed' : ''}`}
                                    >
                                        <img
                                            src={images[0]}
                                            className="notice-image"
                                            alt={post.title}
                                        />
                                        <div className="notice-content">
                                            <div className="notice-header">
                                                <div className="notice-info">
                                                    <p className="notice-title">{post.title}</p>
                                                    {post.isClosed && (
                                                        <p className="closed-notice">
                                                            <span className="closed-text">This post was closed</span>
                                                            {post.closeReason && (
                                                                <>
                                                                    :{" "}
                                                                    {post.closeReason
                                                                        .split("_")
                                                                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                                                        .join(" ")}
                                                                </>
                                                            )}
                                                        </p>
                                                    )}
                                                    <p className="notice-caption">
                                                        {post.caption.length > 100
                                                            ? post.caption.slice(0, 100) + "..."
                                                            : post.caption}
                                                    </p>
                                                </div>
                                                <p className="notice-price">
                                                    {post.price.toLocaleString("de-DE")}₴
                                                </p>
                                            </div>
                                            <div className="notice-footer">
                                                <p>Published {formatDate(post.createdAt)}</p>
                                                <div>Views: {post.views}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination">
                            <div className="pagination-controls">
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="pagination-arrow"
                                >
                                    <ButtonRight
                                        width={50}
                                        height={50}
                                        className="arrow-left"
                                    />
                                </button>

                                <div className="page-numbers">
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
                                    className="pagination-arrow"
                                >
                                    <ButtonRight width={50} height={50} className="arrow-right" />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Notices;

