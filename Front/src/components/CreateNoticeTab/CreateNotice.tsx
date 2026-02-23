import React, { useState, useEffect } from "react";
import { Form, Button, Spinner, Carousel } from "react-bootstrap";
import Select from "react-select";
import { useNavigate } from "react-router-dom";

import "./CreateNotice.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTrash,
} from "@fortawesome/free-solid-svg-icons";

import axios from "axios";

import ButtonRight from "../../assets/icons/ButtonRight.svg?react";

const CreateNotice: React.FC = () => {
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;

    const [title, setTitle] = useState("");
    const [caption, setCaption] = useState("");
    const [price, setPrice] = useState("");
    const [tags, setTags] = useState("");
    const [categoryId, setCategoryId] = useState("0");
    const [categories, setCategories] = useState<{ value: number; label: string }[]>([]);
    const [currency, setCurrency] = useState<"UAH" | "USD" | "EUR">("UAH");
    const [images, setImages] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [isUsed, setIsUsed] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    const currencyOptions = [
        { value: "UAH", label: "₴" },
        { value: "USD", label: "$" },
        { value: "EUR", label: "€" },
    ];

    const [location, setLocation] = useState<string>("Dnipro, Dnipropetrovsk Oblast");

    const cityOptions = [
        { value: "Kyiv, Kyiv Oblast", label: "Kyiv, Kyiv Oblast" },
        { value: "Kharkiv, Kharkiv Oblast", label: "Kharkiv, Kharkiv Oblast" },
        { value: "Odesa, Odesa Oblast", label: "Odesa, Odesa Oblast" },
        { value: "Dnipro, Dnipropetrovsk Oblast", label: "Dnipro, Dnipropetrovsk Oblast" },
        { value: "Donetsk, Donetsk Oblast", label: "Donetsk, Donetsk Oblast" },
        { value: "Zaporizhzhia, Zaporizhzhia Oblast", label: "Zaporizhzhia, Zaporizhzhia Oblast" },
        { value: "Lviv, Lviv Oblast", label: "Lviv, Lviv Oblast" },
        { value: "Kryvyi Rih, Dnipropetrovsk Oblast", label: "Kryvyi Rih, Dnipropetrovsk Oblast" },
        { value: "Mykolaiv, Mykolaiv Oblast", label: "Mykolaiv, Mykolaiv Oblast" },
        { value: "Mariupol, Donetsk Oblast", label: "Mariupol, Donetsk Oblast" },
        { value: "Luhansk, Luhansk Oblast", label: "Luhansk, Luhansk Oblast" },
        { value: "Vinnytsia, Vinnytsia Oblast", label: "Vinnytsia, Vinnytsia Oblast" },
        { value: "Makiivka, Donetsk Oblast", label: "Makiivka, Donetsk Oblast" },
        { value: "Sevastopol, Crimea", label: "Sevastopol, Crimea" },
        { value: "Simferopol, Crimea", label: "Simferopol, Crimea" },
        { value: "Kherson, Kherson Oblast", label: "Kherson, Kherson Oblast" },
        { value: "Poltava, Poltava Oblast", label: "Poltava, Poltava Oblast" },
        { value: "Chernihiv, Chernihiv Oblast", label: "Chernihiv, Chernihiv Oblast" },
        { value: "Cherkasy, Cherkasy Oblast", label: "Cherkasy, Cherkasy Oblast" },
        { value: "Sumy, Sumy Oblast", label: "Sumy, Sumy Oblast" },
        { value: "Zhytomyr, Zhytomyr Oblast", label: "Zhytomyr, Zhytomyr Oblast" },
        { value: "Horlivka, Donetsk Oblast", label: "Horlivka, Donetsk Oblast" },
        { value: "Rivne, Rivne Oblast", label: "Rivne, Rivne Oblast" },
        { value: "Kropyvnytskyi, Kirovohrad Oblast", label: "Kropyvnytskyi, Kirovohrad Oblast" },
        { value: "Kamianske, Dnipropetrovsk Oblast", label: "Kamianske, Dnipropetrovsk Oblast" },
        { value: "Chernivtsi, Chernivtsi Oblast", label: "Chernivtsi, Chernivtsi Oblast" },
        { value: "Ternopil, Ternopil Oblast", label: "Ternopil, Ternopil Oblast" },
        { value: "Ivano-Frankivsk, Ivano-Frankivsk Oblast", label: "Ivano-Frankivsk, Ivano-Frankivsk Oblast" },
        { value: "Bila Tserkva, Kyiv Oblast", label: "Bila Tserkva, Kyiv Oblast" },
        { value: "Melitopol, Zaporizhzhia Oblast", label: "Melitopol, Zaporizhzhia Oblast" },
        { value: "Kerch, Crimea", label: "Kerch, Crimea" },
        { value: "Sloviansk, Donetsk Oblast", label: "Sloviansk, Donetsk Oblast" },
        { value: "Berdyansk, Zaporizhzhia Oblast", label: "Berdyansk, Zaporizhzhia Oblast" },
        { value: "Uzhhorod, Zakarpattia Oblast", label: "Uzhhorod, Zakarpattia Oblast" },
        { value: "Kramatorsk, Donetsk Oblast", label: "Kramatorsk, Donetsk Oblast" },
        { value: "Nizhyn, Chernihiv Oblast", label: "Nizhyn, Chernihiv Oblast" },
        { value: "Fastiv, Kyiv Oblast", label: "Fastiv, Kyiv Oblast" },
    ];

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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const selected = Array.from(e.target.files);
        const combined = [...images, ...selected].slice(0, 6);
        setImages(combined);
    };

    const removeImage = (indexToRemove: number) => {
        const updated = images.filter((_, i) => i !== indexToRemove);
        if (activeIndex - 1 != -1) {
            setActiveIndex(activeIndex - 1);
        }
        setImages(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append("title", title);
        formData.append("caption", caption);
        formData.append("price", price);
        formData.append("tags", tags);
        formData.append("category_id", categoryId ? String(categoryId) : "0");
        formData.append("currency", currency);
        formData.append("location", location);
        formData.append("isUsed", String(false));

        images.forEach((img) => {
            formData.append("images", img);
        });

        try {
            const token = localStorage.getItem("token");
            await axios.post(`${API_URL}/posts`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            navigate("/");
        } catch (error) {
            console.error("Error creating notice:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-notice-container">
            <div className="create-section">
                <div className="form-field">
                    <p className="field-label">Enter title</p>
                    <Form.Control
                        type="text"
                        placeholder="Enter title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="notice-input"
                    />
                </div>

                <div className="form-row">
                    <div className="price-currency-group">
                        <Form.Group className="form-group">
                            <Form.Label>Price</Form.Label>
                            <Form.Control
                                type="number"
                                min={0}
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                required
                                className="price-input"
                                placeholder="Enter price"
                            />
                        </Form.Group>

                        <Form.Group className="form-group">
                            <Form.Label>Currency</Form.Label>
                            <Select
                                options={currencyOptions}
                                value={currencyOptions.find(opt => opt.value === currency)}
                                onChange={(opt) => setCurrency(opt?.value as "UAH" | "USD" | "EUR")}
                                classNamePrefix="react-select"
                                className="currency-select"
                                isSearchable={false}
                            />
                        </Form.Group>
                    </div>

                    <div className="tags-form-group">
                        <Form.Group className="form-group">
                            <Form.Label>Tags (comma-separated)</Form.Label>
                            <Form.Control
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                placeholder="Enter tags"
                                className="notice-input"
                            />
                        </Form.Group>
                        <Form.Group className="form-group">
                            <Form.Label>Category</Form.Label>
                            <Select
                                options={categories}
                                onChange={(selectedOption) => setCategoryId(String(selectedOption?.value))}
                                classNamePrefix="react-select"
                                className="category-select"
                            />
                        </Form.Group>
                    </div>

                    <div className="bottom-form-group">
                        <Form.Group className="form-group">
                            <Form.Label>Location</Form.Label>
                            <Select
                                options={cityOptions}
                                value={cityOptions.find(opt => opt.value === location)}
                                onChange={(opt) => setLocation(opt?.value || "")}
                                classNamePrefix="react-select"
                                className="location-select"
                                isSearchable={true}
                                isClearable={false}
                            />
                        </Form.Group>

                        <Form.Group className="form-group">
                            <Form.Label>Used</Form.Label>
                            <Form.Check
                                type="checkbox"
                                id="isUsed"
                                checked={isUsed}
                                onChange={(e) => setIsUsed(e.target.checked)}
                                className="custom-checkbox"
                            />
                        </Form.Group>
                    </div>
                </div>
            </div>

            <div className="create-section">
                <Form.Group className="image-upload-group">
                    <Form.Label>Upload Images (up to 6)</Form.Label>
                    <Form.Control
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="image-file-input"
                    />
                </Form.Group>

                {images.length > 0 && (
                    <div className="image-carousel-container">
                        <Carousel
                            activeIndex={activeIndex}
                            onSelect={(selectedIndex) => setActiveIndex(selectedIndex)}
                            prevIcon={
                                <span className="carousel-arrow prev-arrow">
                                    <ButtonRight width={40} height={40} />
                                </span>
                            }
                            nextIcon={
                                <span className="carousel-arrow next-arrow">
                                    <ButtonRight width={40} height={40} />
                                </span>
                            }
                            className="notice-carousel"
                        >
                            {images.map((file, index) => (
                                <Carousel.Item key={index}>
                                    <div className="carousel-image-container">
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt={`Image ${index + 1}`}
                                            className="carousel-image"
                                        />
                                    </div>
                                </Carousel.Item>
                            ))}
                        </Carousel>
                        <Button
                            variant="dark"
                            size="sm"
                            className="delete-image-btn"
                            onClick={() => removeImage(activeIndex)}
                            title="Delete current image"
                        >
                            <FontAwesomeIcon icon={faTrash} />
                        </Button>
                    </div>
                )}
            </div>

            <div className="create-section">
                <Form.Group>
                    <Form.Label>Caption</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        required
                        placeholder="Enter caption"
                        className="caption-textarea"
                    />
                </Form.Group>
            </div>

            <div className="submit-container">
                <Button
                    type="submit"
                    variant="success"
                    disabled={loading}
                    onClick={handleSubmit}
                    className="submit-button"
                >
                    {loading ? <Spinner animation="border" size="sm" /> : "Create Notice"}
                </Button>
            </div>
        </div>
    );
};

export default CreateNotice;
