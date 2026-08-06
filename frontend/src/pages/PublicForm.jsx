import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Settings } from "lucide-react";
import "./PublicForm.css";
import { uploadFileApi } from "../api/uploadApi";
import {
    getPublicFormApi,
    evaluateRulesApi,
    submitFormApi,
} from "../api/formApi";
import { z } from "zod";
const resolveFieldLabel = (field, language = "en") => {
    if (typeof field?.label === "string") {
        return field.label;
    }

    return field?.label?.[language] || field?.label?.en || "";
};

function renderField(
    field,
    formValues,
    handleFieldChange,
    fieldStates,
    handleFileUpload,
    uploadProgress,
    uploadedFiles,
    handleRemoveFile,
    selectedLanguage = "en"
) {
    const config = field.config || {};
    const id = `field-${field.id}`;

    const resolveFileName = (fileInfo) => {
        if (!fileInfo) return "Uploaded file";

        if (typeof fileInfo === "string") {
            return fileInfo.split("/").pop() || "Uploaded file";
        }

        const fallbackName =
            fileInfo.original_name ||
            fileInfo.original_filename ||
            fileInfo.filename ||
            fileInfo.file_name ||
            (typeof fileInfo.url === "string"
                ? fileInfo.url.split("/").pop()
                : "");

        return fallbackName || "Uploaded file";
    };

    const resolveFileSize = (fileInfo) => {
        if (!fileInfo) return null;

        const sizeValue =
            fileInfo.size ||
            fileInfo.size_bytes ||
            fileInfo.file_size ||
            fileInfo.bytes;

        if (typeof sizeValue === "number" && Number.isFinite(sizeValue)) {
            if (sizeValue < 1024) return `${sizeValue} B`;
            if (sizeValue < 1024 * 1024) return `${(sizeValue / 1024).toFixed(1)} KB`;
            return `${(sizeValue / (1024 * 1024)).toFixed(1)} MB`;
        }

        if (typeof sizeValue === "string" && /^\d+$/.test(sizeValue)) {
            const numericSize = Number(sizeValue);
            if (numericSize < 1024) return `${numericSize} B`;
            if (numericSize < 1024 * 1024) return `${(numericSize / 1024).toFixed(1)} KB`;
            return `${(numericSize / (1024 * 1024)).toFixed(1)} MB`;
        }

        return null;
    };

    switch (field.type) {
        case "text":
        case "password":
            return (
                <input
                    id={id}
                    type={field.type === "password" ? "password" : "text"}
                    placeholder={config.placeholder || resolveFieldLabel(field, selectedLanguage)}
                    value={formValues[field.id] || ""}
                    onChange={(e) =>
                        handleFieldChange(field.id, e.target.value)
                    }
                />
            );
        case "email":
            return (
                <input
                    id={id}
                    type="email"
                    placeholder={config.placeholder || resolveFieldLabel(field, selectedLanguage)}
                    value={formValues[field.id] || ""}
                    onChange={(e) =>
                        handleFieldChange(field.id, e.target.value)
                    }
                />
            );
        case "number":
            return (
                <input
                    id={id}
                    type="number"
                    min={
                        config.min !== undefined
                            ? Number(config.min)
                            : undefined
                    }
                    max={
                        config.max !== undefined
                            ? Number(config.max)
                            : undefined
                    }
                    value={formValues[field.id] || ""}

                    onChange={(e) =>
                        handleFieldChange(field.id, e.target.value)
                    }
                />
            );
        case "date":
            return (
                <input
                    id={id}
                    type="date"
                    min={config.min_date || undefined}
                    max={config.max_date || undefined}
                    value={formValues[field.id] || ""}

                    onChange={(e) =>
                        handleFieldChange(field.id, e.target.value)
                    }
                />
            );
        case "textarea":
            return (
                <textarea
                    id={id}
                    placeholder={resolveFieldLabel(field, selectedLanguage)}
                    value={formValues[field.id] || ""}

                    onChange={(e) =>
                        handleFieldChange(field.id, e.target.value)
                    }
                />
            );
        case "dropdown": {
            const options = Array.isArray(config.options)
                ? config.options
                : String(config.options || "")
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean);

            return (
                <select
                    id={id}
                    value={formValues[field.id] || ""}
                    required={
                        fieldStates?.[field.id]?.required ||
                        Boolean(config.required)
                    }
                    onChange={(e) =>
                        handleFieldChange(field.id, e.target.value)
                    }
                >
                    <option value="">Select...</option>

                    {options.map((opt) => (
                        <option key={opt} value={opt}>
                            {opt}
                        </option>
                    ))}
                </select>
            );
        }
        case "radio": {
            const options = Array.isArray(config.options)
                ? config.options
                : String(config.options || "")
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean);

            return (
                <div className="radio-group">
                    {options.map((opt) => (
                        <label key={opt}>
                            <input
                                type="radio"
                                name={id}
                                value={opt}
                                checked={formValues[field.id] === opt}
                                required={
                                    fieldStates?.[field.id]?.required ||
                                    Boolean(config.required)
                                }
                                onChange={(e) =>
                                    handleFieldChange(field.id, e.target.value)
                                }
                            />
                            {opt}
                        </label>
                    ))}
                </div>
            );
        }
        case "checkbox":
            return (
                <div className="checkbox-preview">
                    <input
                        id={id}
                        type="checkbox"
                        checked={Boolean(formValues[field.id])}
                        onChange={(e) => handleFieldChange(field.id, e.target.checked)}
                    />
                    <span>{resolveFieldLabel(field, selectedLanguage)}</span>
                </div>
            );
        case "file": {
            const uploadedFile = uploadedFiles?.[field.id];
            const hasUploadedFile = Boolean(uploadedFile);
            const currentProgress = Number(uploadProgress?.[field.id] || 0);
            const progressPercent = Math.min(100, Math.max(0, currentProgress));
            const fileName = resolveFileName(uploadedFile);
            const fileSize = resolveFileSize(uploadedFile);

            if (hasUploadedFile) {
                console.log("Uploaded file payload:", uploadedFile);

                return (
                    <div className="file-input-wrapper">
                        <div className="file-card-modern">
                            <div className="file-card-main">
                                <div className="file-icon-badge">📄</div>
                                <div className="file-card-info">
                                    <div className="file-card-header">
                                        <h4>{fileName}</h4>
                                        <span className="upload-success-badge">Upload Complete</span>
                                    </div>
                                    <div className="upload-progress-track">
                                        <div
                                            className="upload-progress-fill"
                                            style={{ width: `${progressPercent}%` }}
                                        />
                                    </div>
                                    <div className="file-card-meta">
                                        <small>{fileSize || "File ready"}</small>
                                        <small>{progressPercent}%</small>
                                    </div>
                                </div>
                            </div>
                            <button
                                className="delete-btn"
                                type="button"
                                onClick={() => handleRemoveFile(field.id)}
                            >
                                🗑️
                            </button>
                        </div>
                    </div>
                );
            }

            if (currentProgress > 0) {
                return (
                    <div className="file-input-wrapper">
                        <div className="upload-progress-card">
                            <div className="upload-progress-track">
                                <div
                                    className="upload-progress-fill"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                            <p className="upload-progress-text">
                                {progressPercent === 100
                                    ? "Upload Complete ✅"
                                    : `Uploading... ${progressPercent}%`}
                            </p>
                        </div>
                    </div>
                );
            }

            return (
                <div className="file-input-wrapper">
                    <input
                        id={id}
                        type="file"
                        hidden
                        accept={config.allowed_types || "*"}
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(field.id, file);
                        }}
                    />

                    <label htmlFor={id} className="upload-box">
                        <div className="upload-icon">📤</div>
                        <div>
                            <h4>Click to upload</h4>
                            <p>PDF, DOCX, PNG, JPG (Max 5MB)</p>
                        </div>
                    </label>
                </div>
            );
        }
        case "rating": {
            const maxStars = Number(config.max_rating || 5);
            const selectedRating = Number(formValues[field.id] || 0);

            return (
                <div className="rating-preview">
                    {Array.from({ length: maxStars }, (_, i) => {
                        const rating = i + 1;
                        const isFilled = rating <= selectedRating;

                        return (
                            <button
                                key={rating}
                                type="button"
                                className="star-icon"
                                aria-label={`Rate ${rating} out of ${maxStars}`}
                                onClick={() => handleFieldChange(field.id, rating)}
                                style={{
                                    cursor: "pointer",
                                    fontSize: "28px",
                                    color: isFilled ? "var(--warning)" : "var(--border-strong)",
                                    background: "transparent",
                                    border: "none",
                                    padding: 0,
                                    lineHeight: 1,
                                }}
                            >
                                ★
                            </button>
                        );
                    })}
                </div>
            );
        }

        default:
            return null;
    }
}

export default function PublicForm() {
    const { token } = useParams();
    const [form, setForm] = useState(null);
    const navigate = useNavigate();
    const [formValues, setFormValues] = useState({});
    const [fieldStates, setFieldStates] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [errors, setErrors] = useState({});
    const [uploadProgress, setUploadProgress] = useState({});
    const [uploadedFiles, setUploadedFiles] = useState({});
    const [idempotencyKey, setIdempotencyKey] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState("en");
    const handleFieldChange = async (fieldId, value) => {
        const updatedValues = {
            ...formValues,
            [fieldId]: value,
        };

        setFormValues(updatedValues);

        if (!form?.id) return;

        try {
            const res = await evaluateRulesApi(form.id, updatedValues);

            setFieldStates(res.data || {});
        } catch (err) {
            console.error(err);
        }
    };
    const handleFileUpload = async (fieldId, file) => {
        if (!file) return;

        // Find the field configuration
        const field = form?.fields?.find(f => f.id === fieldId);
        const config = field?.config || {};

        // Allowed extensions
        const allowedExtensions = (config.file_types || [])
            .map(ext => ext.toLowerCase());

        // Current file extension
        const fileExtension = "." + file.name.split(".").pop().toLowerCase();

        if (
            allowedExtensions.length > 0 &&
            allowedExtensions[0] !== "*" &&
            !allowedExtensions.includes(fileExtension)
        ) {
            alert(
                `Invalid file type.\nAllowed: ${allowedExtensions.join(", ")}`
            );
            return;
        }

        // File size validation
        const maxSize = 5 * 1024 * 1024;

        if (file.size > maxSize) {
            alert("File size cannot exceed 5 MB");
            return;
        }

        try {
            setUploadProgress(prev => ({
                ...prev,
                [fieldId]: 10,
            }));

            const response = await uploadFileApi(
                file,
                (event) => {
                    const percent = Math.round(
                        (event.loaded * 100) / event.total
                    );

                    setUploadProgress(prev => ({
                        ...prev,
                        [fieldId]: percent,
                    }));
                }
            );
            console.log("Upload Response:", response.data);
            // ✅ Print the backend response here

            setUploadProgress(prev => ({
                ...prev,
                [fieldId]: 100,
            }));
            setUploadedFiles(prev => ({
                ...prev,
                [fieldId]: response.data,
            }));

            setFormValues(prev => ({
                ...prev,
                [fieldId]: response.data.url,
            }));
        } catch (err) {
            console.error(err);

            console.log(err.response);
            console.log(err.response?.data);

            alert(
                err.response?.data?.detail ||
                err.response?.data?.message ||
                "Upload failed"
            );
        }
    };
    const handleRemoveFile = (fieldId) => {
        setUploadedFiles(prev => {
            const copy = { ...prev };
            delete copy[fieldId];
            return copy;
        });

        setFormValues(prev => {
            const copy = { ...prev };
            delete copy[fieldId];
            return copy;
        });

        setUploadProgress(prev => {
            const copy = { ...prev };
            delete copy[fieldId];
            return copy;
        });
    };
    const onSubmit = async () => {
        if (isSubmitting) return;

        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 50));

        let key = sessionStorage.getItem("idempotencyKey");

        if (!key) {
            key = crypto.randomUUID();
            sessionStorage.setItem("idempotencyKey", key);
        }

        try {
            setErrors({});

            // -----------------------
            // Client-side validation
            // -----------------------
            for (const field of (form?.fields || [])) {
                const value = formValues[field.id];
                const config = field.config || {};

                // -----------------------
                // Required File Validation
                // -----------------------
                if (
                    field.type === "file" &&
                    (config.required || fieldStates?.[field.id]?.required) &&
                    !uploadedFiles[field.id]
                ) {
                    alert(`${resolveFieldLabel(field, selectedLanguage)} is required`);
                    return;
                }

                if (
                    field.type === "rating" &&
                    (config.required || fieldStates?.[field.id]?.required)
                ) {
                    const selectedRating = Number(formValues[field.id]);

                    if (
                        !Number.isFinite(selectedRating) ||
                        selectedRating < 1 ||
                        selectedRating > 5
                    ) {
                        setErrors((prev) => ({
                            ...prev,
                            [field.id]: ["Please select a rating."],
                        }));
                        return;
                    }
                }

                // -----------------------
                // File Validation
                // -----------------------

                // -----------------------
                // Email Validation
                // -----------------------
                if (field.type === "email" && value) {
                    try {
                        z.string().email().parse(value);
                    } catch {
                        alert(`${resolveFieldLabel(field, selectedLanguage)} must be a valid email`);
                        return;
                    }
                }

                // -----------------------
                // Number Validation
                // -----------------------
                if (field.type === "number" && value !== "") {

                    if (isNaN(Number(value))) {
                        alert(`${resolveFieldLabel(field, selectedLanguage)} must be a valid number`);
                        return;
                    }

                    if (
                        config.min !== undefined &&
                        Number(value) < Number(config.min)
                    ) {
                        alert(`${resolveFieldLabel(field, selectedLanguage)} must be at least ${config.min}`);
                        return;
                    }

                    if (
                        config.max !== undefined &&
                        Number(value) > Number(config.max)
                    ) {
                        alert(`${resolveFieldLabel(field, selectedLanguage)} must be at most ${config.max}`);
                        return;
                    }
                }

                // -----------------------
                // Text Validation
                // -----------------------
                if (field.type === "text" && value) {

                    if (
                        config.min_length &&
                        value.length < config.min_length
                    ) {
                        alert(`${resolveFieldLabel(field, selectedLanguage)} is too short`);
                        return;
                    }

                    if (
                        config.max_length &&
                        value.length > config.max_length
                    ) {
                        alert(`${resolveFieldLabel(field, selectedLanguage)} is too long`);
                        return;
                    }
                }
            }

            // -----------------------
            // Submit to backend
            // -----------------------
            const payload = { ...formValues };

            Object.keys(uploadedFiles).forEach((fieldId) => {
                payload[fieldId] = uploadedFiles[fieldId].url;
            });
            console.log("Uploaded Files:", uploadedFiles);
            console.log("Payload:", payload);

            const res = await submitFormApi(
                form.id,
                payload,
                key
            );
            setErrors({});
            setFormValues({});
            setFieldStates({});
            setUploadedFiles({});
            setUploadProgress({});
            // Show loader for 2 seconds
            await new Promise(resolve => setTimeout(resolve, 2000));

            sessionStorage.removeItem("idempotencyKey");

            navigate("/submission-success", {
                state: {
                    responseId: res.data.response_id,
                    submittedAt: res.data.submitted_at,
                    formTitle: res.data.form_title,
                },
            });

            // Clear form after successful submission
        } catch (err) {
            console.error(err);
            console.log("Backend Error:", err.response?.data);
            console.log("Status:", err.response?.status);

            // -----------------------
            // Backend field errors
            // -----------------------
            if (err.response?.data?.detail?.errors) {
                setErrors(err.response.data.detail.errors);
                return;
            }

            // -----------------------
            // Zod validation
            // -----------------------
            if (err instanceof z.ZodError) {
                alert(err.errors[0].message);
                return;
            }

            if (!err.response) {
                alert("Network error. Please check your internet connection and try again.");
                return;
            }

            // -----------------------
            // Generic error
            // -----------------------
            alert(
                JSON.stringify(err.response?.data, null, 2) ||
                err.message ||
                "Something went wrong"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        let mounted = true;

        const fetchForm = async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await getPublicFormApi(token);
                if (!mounted) return;
                setForm(res.data || null);
                console.log("Form Data:", res.data);
            } catch (err) {
                console.error(err);
                if (!mounted) return;
                setError("Failed to load form.");
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchForm();

        return () => {
            mounted = false;
        };
    }, [token]);

    if (loading)
        return (
            <div className="public-form-shell">
                <main className="public-form">
                    <div className="loading-state">Loading form…</div>
                </main>
            </div>
        );
    if (error)
        return (
            <div className="public-form-shell">
                <main className="public-form">
                    <div className="status-card error">{error}</div>
                </main>
            </div>
        );
    if (!form)
        return (
            <div className="public-form-shell">
                <main className="public-form">
                    <div className="empty-state">Form not found.</div>
                </main>
            </div>
        );
    const fields = form?.fields || [];

    return (
        <div className="public-form-shell">
            <main className="public-form">
                <header className="public-form-header">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                        <div>
                            <p className="eyebrow">Public Form</p>
                            <h1>{form.title || "Untitled Form"}</h1>
                            {form.description && <p>{form.description}</p>}
                        </div>
                        <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "0.9rem" }}>
                            Language
                            <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)}>
                                <option value="en">English (en)</option>
                                <option value="te">Telugu (te)</option>
                            </select>
                        </label>
                    </div>
                </header>

                <form
                    noValidate
                    onSubmit={(e) => {
                        e.preventDefault();
                        onSubmit();
                    }}
                >
                    <section className="public-fields">
                        {fields.length === 0 ? (
                            <div className="empty-state">
                                No fields available.
                            </div>
                        ) : (
                            fields
                                .filter((field) => {
                                    const state = fieldStates?.[field.id];

                                    return state ? state.visible : true;
                                })
                                .map((field) => (
                                    <div className="public-field" key={field.id}>
                                        <label>
                                            {resolveFieldLabel(field, selectedLanguage)}
                                            {(fieldStates?.[field.id]?.required ||
                                                field.config?.required) && (
                                                    <span className="required-mark">*</span>
                                                )}
                                        </label>

                                        {renderField(
                                            field,
                                            formValues,
                                            handleFieldChange,
                                            fieldStates,
                                            handleFileUpload,
                                            uploadProgress,
                                            uploadedFiles,
                                            handleRemoveFile,
                                            selectedLanguage
                                        )}
                                        {errors?.[field.id] && (
                                            <div className="field-error">
                                                {errors[field.id][0]}
                                            </div>
                                        )}
                                    </div>
                                ))
                        )}
                    </section>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="submit-btn"
                    >
                        {isSubmitting ? "Submitting..." : "Submit"}
                    </button>
                    {isSubmitting && (
                        <div className="submit-loader">
                            <Settings className="gear-big" size={40} />
                            <p>Please wait...</p>
                        </div>
                    )}
                </form>
            </main>
        </div>
    );
}