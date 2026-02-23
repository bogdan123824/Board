import React, { useState, } from "react";
import { Form, Button, Alert, Carousel } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import "./Verify.css";

import ButtonRight from "../../assets/icons/ButtonRight.svg?react";

const Verify: React.FC = () => {
    const [images, setImages] = useState<File[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        setSuccess(null);

        if (e.target.files) {
            const newFiles = Array.from(e.target.files);

            if (images.length + newFiles.length > 6) {
                setError("You can upload up to 6 images only.");
                return;
            }

            setImages(prev => [...prev, ...newFiles]);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => {
            const newImages = [...prev];
            newImages.splice(index, 1);
            return newImages;
        });
        if (activeIndex >= images.length - 1 && activeIndex > 0) {
            setActiveIndex(activeIndex - 1);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (images.length === 0) {
            setError("Please select at least one image.");
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        const API_URL = import.meta.env.VITE_API_URL;

        try {
            const formData = new FormData();
            images.forEach(image => formData.append("files", image));

            const token = localStorage.getItem("token");

            const response = await fetch(`${API_URL}/verification/request`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token || ""}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || "Failed to submit verification request.");
            }

            setSuccess("Verification request submitted successfully.");
            setImages([]);
            setActiveIndex(0);
        } catch (err: any) {
            setError(err.message || "An error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="verification-container">
            <Form
                onSubmit={handleSubmit}
                className="verification-form"
            >
                <div className="verification-instructions">
                    <Form.Label className="verification-label">
                        Please upload a photo where you are holding or standing next to the item you want to post.
                    </Form.Label>
                    <Form.Label className="verification-label">
                        We use this to confirm that the person and item are real.
                    </Form.Label>
                </div>

                <Form.Group className="verification-upload-group">
                    <Form.Control
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="verification-file-input"
                    />
                </Form.Group>

                {images.length > 0 && (
                    <div className="verification-carousel-container">
                        <Carousel
                            activeIndex={activeIndex}
                            onSelect={(selectedIndex) => setActiveIndex(selectedIndex)}
                            prevIcon={
                                <span className="verification-carousel-arrow prev">
                                    <ButtonRight width={40} height={40} />
                                </span>
                            }
                            nextIcon={
                                <span className="verification-carousel-arrow next">
                                    <ButtonRight width={40} height={40} />
                                </span>
                            }
                            className="verification-carousel"
                        >
                            {images.map((file, index) => (
                                <Carousel.Item key={index}>
                                    <div className="verification-image-container">
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt={`Verification image ${index + 1}`}
                                            className="verification-image"
                                        />
                                    </div>
                                </Carousel.Item>
                            ))}
                        </Carousel>

                        <Button
                            variant="dark"
                            size="sm"
                            className="verification-delete-btn"
                            onClick={() => removeImage(activeIndex)}
                            title="Delete current image"
                        >
                            <FontAwesomeIcon icon={faTrash} />
                        </Button>
                    </div>
                )}

                {error && (
                    <Alert variant="danger" className="verification-alert">
                        {error}
                    </Alert>
                )}
                {success && (
                    <Alert variant="success" className="verification-alert">
                        {success}
                    </Alert>
                )}
            </Form>

            <div className="verification-submit-container">
                <Button
                    disabled={loading || images.length === 0}
                    className="verification-submit-btn"
                    onClick={handleSubmit}
                >
                    {loading ? "Submitting..." : images.length === 0 ? "Attach at least one photo!" : "Submit Request"}
                </Button>
            </div>
        </div>
    );
};

export default Verify;
