import React, { useState, useEffect } from "react";
import "./Main.css";

import { Spinner, Form, Button } from "react-bootstrap";
import axios from "axios";
import Select from "react-select";
import { useNavigate, useLocation } from "react-router-dom";

import Search from "../../assets/icons/Search.svg?react";

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
    category_id: number;
    isUsed: boolean;
    currency: string;
    location: string;
}

interface CategoryOption {
    value: number;
    label: string;
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

const Main: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const [categories, setCategories] = useState<CategoryOption[]>([]);

    const [minPrice, setMinPrice] = useState<string>("");
    const [maxPrice, setMaxPrice] = useState<string>("");
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const [title, setTitle] = useState<string>("");
    const [activeTab, setActiveTab] = useState<string>('All');

    const [currentPage, setCurrentPage] = useState<number>(1);
    const postsPerPage = 6;

    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${API_URL}/categories`);
                const options = response.data.map((cat: any) => ({
                    value: cat.id,
                    label: cat.name,
                }));
                setCategories(options);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        if (location.state && location.state.title) {
            setTitle(location.state.title);
            handleSearch(location.state.title);
        } else {
            loadPosts();
        }
    }, [location.state]);

    const loadPosts = async () => {
        setLoading(true);
        try {
            const res = await axios.get<Post[]>(`${API_URL}/posts`);

            const postsWithSerializedImages: Post[] = res.data.map(post => ({
                ...post,
                images: JSON.stringify(post.images ?? []),
            }));

            setPosts(postsWithSerializedImages);
        } catch (err) {
            console.error("Error loading posts:", err);
        } finally {
            setLoading(false);
        }
    };

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

    const handleSearch = async (customTitle?: string) => {
        setLoading(true);
        try {
            const params: any = {};

            const searchTitle = customTitle?.trim() || title.trim();
            if (searchTitle) params.title = searchTitle;
            if (minPrice.trim()) params.min_price = Number(minPrice);
            if (maxPrice.trim()) params.max_price = Number(maxPrice);

            if (categoryId) {
                const cat = categories.find((c) => c.value === Number(categoryId));
                if (cat) params.category_name = cat.label;
            }

            const res = await axios.get<Post[]>(`${API_URL}/posts/filter`, { params });

            const postsWithSerializedImages: Post[] = res.data.map(post => ({
                ...post,
                images: JSON.stringify(post.images ?? []),
            }));

            setPosts(postsWithSerializedImages);

            setCurrentPage(1);
        } catch (error: any) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                setPosts([]);
            } else {
                console.error("Error searching posts:", error);
            }
        } finally {
            setLoading(false);
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
        <>
            <Form className="search-form">
                <div className="main-page-form-row">
                    <Form.Group controlId="categorySelect" className="form-group">
                        <Form.Label>Category</Form.Label>
                        <Select
                            options={categories}
                            onChange={(selectedOption) => setCategoryId(selectedOption ? String(selectedOption.value) : null)}
                            value={categories.find((c) => c.value === Number(categoryId)) || null}
                            isClearable
                            classNamePrefix="react-select"
                            className="react-select-container"
                        />
                    </Form.Group>

                    <Form.Group controlId="titleInput" className="form-group">
                        <Form.Label>Title</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </Form.Group>
                </div>

                <div className="main-page-price-form">
                    <Form.Group controlId="minPriceInput" className="form-group price-group">
                        <Form.Label>Price</Form.Label>
                        <Form.Control
                            type="number"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            min={0}
                            placeholder="From"
                            className="no-spinner"
                        />
                    </Form.Group>

                    <Form.Group controlId="maxPriceInput" className="form-group price-group">
                        <Form.Control
                            type="number"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            min={0}
                            placeholder="To"
                            className="no-spinner"
                        />
                    </Form.Group>

                    <div className="button-group">
                        <Button onClick={() => handleSearch()} disabled={loading} className="search-button">
                            <Search width={22} height={22} />
                        </Button>
                        <Button
                            onClick={() =>
                                navigate('/profile', {
                                    state: { tab: 'create notice' }
                                })
                            }
                            className="create-button"
                        >
                            Create notice
                        </Button>
                    </div>
                </div>
            </Form>

            <p className="results-count">
                Found {getFilteredPosts().length} notice{getFilteredPosts().length > 1 && "s"}
            </p>

            <div className="notices-header">
                <p className="notices-title">Notices</p>
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

            <div className="notices-container">
                {loading ? (
                    <Spinner animation="border" />
                ) : posts.length === 0 ? (
                    <p className="no-notices">No notices found.</p>
                ) : (
                    <div className="notices-list">
                        {currentPosts.map((post) => {
                            const images = getImageUrls(post.images);
                            return (
                                <div
                                    onClick={() => navigate(`/post/${post.id}`)}
                                    key={post.id}
                                    className="notice-card"
                                >
                                    <div className="card-content">
                                        {images.length > 0 && (
                                            <img
                                                src={images[0]}
                                                className="notice-image"
                                                alt={post.title}
                                            />
                                        )}
                                        <div className="notice-details">
                                            <div className="notice-header">
                                                <div className="notice-info">
                                                    <p className="notice-title">{post.title}</p>
                                                    <p className="notice-caption">
                                                        {post.caption.length > 300 ? post.caption.slice(0, 100) + "..." : post.caption}
                                                    </p>
                                                </div>
                                                <p className="notice-price">
                                                    {post.price.toLocaleString("de-DE")}{post.currency == "UAH" ? "₴" : post.currency == "USD" ? "$" : "€"}
                                                </p>
                                            </div>
                                            <div className="notice-footer">
                                                <p>{post.location} - {formatDate(post.createdAt)}</p>
                                                <p> Views: {post.views}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
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
                    </div>
                )}
            </div>
        </>
    );
};

export default Main;
