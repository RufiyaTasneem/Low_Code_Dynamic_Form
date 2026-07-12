import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPublicFormApi } from "../api/formApi";
import "./PublicForm.css";

const renderField = (field) => {
    const config = field.config || {};
    const isRequired = Boolean(config.required);
    const id = `field-${field.id}`;

    switch (field.type) {
        case "text":
        case "password":
            return (
                <input
                    id={id}
                    type={field.type === "password" ? "password" : "text"}
                    placeholder={config.placeholder || field.label}
                    disabled
                />
            );
        case "email":
            return (
                <input
                    id={id}
                    type="email"
                    placeholder={config.placeholder || field.label}
                    disabled
                />
            );
        case "number":
            return (
                <input
                    id={id}
                    type="number"
                    min={config.min !== undefined ? Number(config.min) : undefined}
                    max={config.max !== undefined ? Number(config.max) : undefined}
                    disabled
                />
            );
        case "date":
            return (
                <input
                    id={id}
                    type="date"
                    min={config.min_date || undefined}
                    max={config.max_date || undefined}
                    disabled
                />
            );
        case "textarea":
            return <textarea id={id} placeholder={field.label} disabled />;
        case "dropdown": {
            const options = Array.isArray(config.options)
                ? config.options
                : String(config.options || "")
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean);

            return (
                <select id={id} disabled>
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
                            <input type="radio" name={id} disabled /> {opt}
                        </label>
                    ))}
                </div>
            );
        }
        case "checkbox":
            return (
                <div className="checkbox-preview">
                    <input id={id} type="checkbox" disabled /> <span>{field.label}</span>
                </div>
            );
        case "file":
            return <input id={id} type="file" disabled />;
        case "rating":
            return (
                <div className="rating-preview" aria-label="Rating preview">
                    {Array.from({ length: 5 }, (_, i) => (
                        <span key={i} className="star-icon">☆</span>
                    ))}
                </div>
            );
        default:
            return <input id={id} type="text" placeholder={field.label} disabled />;
    }
};

export default function PublicForm() {
    const { token } = useParams();
    const [form, setForm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;

        const fetchForm = async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await getPublicFormApi(token);
                if (!mounted) return;
                setForm(res.data || null);
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

    if (loading) return <div className="public-form-shell"><main className="public-form"><div className="loading-state">Loading form…</div></main></div>;
    if (error) return <div className="public-form-shell"><main className="public-form"><div className="status-card error">{error}</div></main></div>;
    if (!form) return <div className="public-form-shell"><main className="public-form"><div className="empty-state">Form not found.</div></main></div>;

    const fields = form.fields || [];

    return (
        <div className="public-form-shell">
            <main className="public-form">
                <header className="public-form-header">
                    <p className="eyebrow">Public Form</p>
                    <h1>{form.title || "Untitled Form"}</h1>
                    {form.description && <p>{form.description}</p>}
                </header>

                <section className="public-fields">
                    {fields.length === 0 ? (
                        <div className="empty-state">No fields available.</div>
                    ) : (
                        fields.map((field) => (
                            <div className="public-field" key={field.id}>
                                <label>
                                    {field.label}
                                    {field.config && field.config.required && (
                                        <span className="required-mark">*</span>
                                    )}
                                </label>
                                {renderField(field)}
                            </div>
                        ))
                    )}
                </section>

                <button type="button" className="submit-btn">
                    Submit Form
                </button>
            </main>
        </div>
    );
}
