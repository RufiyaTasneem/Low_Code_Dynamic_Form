import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getMyFormsApi,
    publishFormApi,
    generateShareableLinkApi,
    duplicateFormApi,
} from "../api/formApi";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import TopBar from "../components/dashboard/TopBar";
import "./Forms.css";

const resolveText = (value, language = "en") => {
    if (!value) return "";
    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value);
            if (typeof parsed === "object" && parsed !== null) {
                return parsed[language] || parsed.en || "";
            }
        } catch (e) {
            // Plain string
        }
        return value;
    }
    if (typeof value === "object" && value !== null) {
        return value[language] || value.en || "";
    }
    return String(value);
};

export default function Forms() {
    const navigate = useNavigate();

    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadForms();
    }, []);

    async function loadForms() {
        try {
            setLoading(true);

            const res = await getMyFormsApi();

            console.log("========== FORMS API ==========");
            console.log(res);
            console.log("Response Data:", res.data);
            console.log("Is Array:", Array.isArray(res.data));
            console.log("===============================");

            setForms(res.data || []);
        } catch (err) {
            console.error("Forms API Error:", err);
            console.log("Response:", err.response);
            console.log("Response Data:", err.response?.data);
        } finally {
            setLoading(false);
        }
    }

    async function handlePublish(formId) {
        try {
            await publishFormApi(formId);
            alert("Form published successfully!");
            loadForms();
        } catch (err) {
            console.error(err);
            alert("Failed to publish form");
        }
    }

    async function handleShare(formId) {
        try {
            const res = await generateShareableLinkApi(formId);

            const link =
                res.data?.url ||
                res.data?.link ||
                res.data?.public_url ||
                JSON.stringify(res.data);

            await navigator.clipboard.writeText(link);

            alert("Share link copied to clipboard!");
        } catch (err) {
            console.error(err);
            alert("Unable to generate share link");
        }
    }
    async function handleDuplicate(formId) {
        try {
            const res = await duplicateFormApi(formId);

            alert("Form duplicated successfully!");

            // Get the new form id returned by the backend
            const newFormId = res.data.id;

            // Optional: refresh the forms page
            await loadForms();

            // Open the duplicated form
            navigate(`/builder?id=${newFormId}`);

        } catch (err) {
            console.error(err);
            alert("Failed to duplicate form");
        }
    }
    return (
        <DashboardLayout>
            <TopBar
                title="My Forms"
                subtitle="Manage all your dynamic forms"
                showButton
            />

            {loading ? (
                <div className="loading">
                    Loading forms...
                </div>
            ) : forms.length === 0 ? (
                <div className="empty-state">
                    <h2>No Forms Yet</h2>

                    <p>Create your first dynamic form.</p>

                    <button
                        className="create-form-btn"
                        onClick={() => navigate("/builder")}
                    >
                        Create Form
                    </button>
                </div>
            ) : (
                <div className="forms-grid">
                    {forms.map((form) => (
                        <div
                            className="form-card"
                            key={form.id}
                        >
                            <div className="form-top">
                                <h2>{resolveText(form.title)}</h2>

                                <span
                                    className={
                                        form.status === "published"
                                            ? "status published"
                                            : "status draft"
                                    }
                                >
                                    {form.status}
                                </span>
                            </div>

                            <p className="description">
                                {resolveText(form.description) || "No description"}
                            </p>

                            <div className="form-info">
                                <div>
                                    <strong>ID</strong>
                                    <p>{form.id}</p>
                                </div>

                                <div>
                                    <strong>Version</strong>
                                    <p>{form.version ?? 1}</p>
                                </div>

                                <div>
                                    <strong>Status</strong>
                                    <p>{form.status}</p>
                                </div>
                            </div>

                            <div className="form-actions">
                                <button
                                    className="edit-btn"
                                    onClick={() =>
                                        navigate(`/builder?id=${form.id}`)
                                    }
                                >
                                    ✏️ Edit
                                </button>
                                <button
                                    className="duplicate-btn"
                                    onClick={() => handleDuplicate(form.id)}
                                >
                                    📄 Duplicate
                                </button>
                                <button
                                    className="analytics-btn"
                                    onClick={() =>
                                        navigate(`/analytics?id=${form.id}`)
                                    }
                                >
                                    📊 Analytics
                                </button>

                                <button
                                    className="share-btn"
                                    onClick={() => handleShare(form.id)}
                                >
                                    🔗 Share
                                </button>

                                {form.status !== "published" && (
                                    <button
                                        className="publish-btn"
                                        onClick={() =>
                                            handlePublish(form.id)
                                        }
                                    >
                                        🚀 Publish
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}