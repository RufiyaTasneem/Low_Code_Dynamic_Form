import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import {
    getMyFormsApi,
    publishFormApi,
    generateShareableLinkApi,
    duplicateFormApi,
    deleteFormApi,
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
    const { t, i18n } = useTranslation();

    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [formToDelete, setFormToDelete] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        loadForms();
    }, []);

    async function loadForms() {
        try {
            setLoading(true);
            const res = await getMyFormsApi();
            setForms(res.data || []);
        } catch (err) {
            console.error("Forms API Error:", err);
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
            const newFormId = res.data.id;
            await loadForms();
            navigate(`/builder?id=${newFormId}`);
        } catch (err) {
            console.error(err);
            alert("Failed to duplicate form");
        }
    }

    const openDeleteModal = (form) => {
        setFormToDelete(form);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        if (deleting) return;
        setFormToDelete(null);
        setShowDeleteModal(false);
    };

    const confirmDelete = async () => {
        if (!formToDelete) return;
        try {
            setDeleting(true);
            await deleteFormApi(formToDelete.id);
            setForms((prevForms) => prevForms.filter((f) => f.id !== formToDelete.id));
            alert(t("Form deleted successfully."));
            setFormToDelete(null);
            setShowDeleteModal(false);
        } catch (err) {
            console.error("Delete form failed:", err);
            alert(t("Failed to delete form. Please try again."));
        } finally {
            setDeleting(false);
        }
    };

    const filteredForms = forms.filter((form) => {
        if (!searchTerm.trim()) return true;
        const titleStr = resolveText(form.title, i18n.language || "en").toLowerCase();
        return titleStr.includes(searchTerm.trim().toLowerCase());
    });

    return (
        <DashboardLayout>
            <TopBar
                title="Forms"
                subtitle="Manage all your dynamic forms"
                showButton
            />

            <div className="forms-search-bar">
                <Search size={18} className="forms-search-icon" />
                <input
                    type="text"
                    className="forms-search-input"
                    placeholder={t("Search forms by title...")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="loading">
                    {t("Loading...")}
                </div>
            ) : forms.length === 0 ? (
                <div className="empty-state">
                    <h2>{t("No forms found")}</h2>
                    <p>{t("Create your first dynamic form.")}</p>
                    <button
                        className="create-form-btn"
                        onClick={() => navigate("/builder")}
                    >
                        {t("Create Form")}
                    </button>
                </div>
            ) : filteredForms.length === 0 ? (
                <div className="empty-state">
                    <h2>{t("No forms found")}</h2>
                    <p>{t("No forms match your search.")}</p>
                    <button
                        className="create-form-btn"
                        onClick={() => setSearchTerm("")}
                    >
                        {t("Clear Search")}
                    </button>
                </div>
            ) : (
                <div className="forms-grid">
                    {filteredForms.map((form) => (
                        <div className="form-card" key={form.id}>
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
                                    <strong>{t("Version")}</strong>
                                    <p>{form.version ?? 1}</p>
                                </div>
                                <div>
                                    <strong>{t("Status")}</strong>
                                    <p>{form.status}</p>
                                </div>
                            </div>

                            <div className="form-actions">
                                <button
                                    className="edit-btn"
                                    onClick={() => navigate(`/builder?id=${form.id}`)}
                                >
                                    ✏️ {t("Edit")}
                                </button>
                                <button
                                    className="duplicate-btn"
                                    onClick={() => handleDuplicate(form.id)}
                                >
                                    📄 {t("Duplicate")}
                                </button>
                                <button
                                    className="analytics-btn"
                                    onClick={() => navigate(`/analytics?id=${form.id}`)}
                                >
                                    📊 {t("Analytics")}
                                </button>
                                <button
                                    className="share-btn"
                                    onClick={() => handleShare(form.id)}
                                >
                                    🔗 Share
                                </button>
                                <button
                                    className="delete-btn"
                                    onClick={() => openDeleteModal(form)}
                                >
                                    🗑 {t("Delete")}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showDeleteModal && formToDelete && (
                <div className="delete-modal-overlay">
                    <div className="delete-modal-content">
                        <h3 style={{ margin: 0, fontSize: "1.25rem", color: "var(--text, #fff)" }}>
                            {t("Delete Form")}
                        </h3>
                        <p style={{ margin: "16px 0 8px 0", color: "var(--text-muted, #94a3b8)", fontSize: "0.95rem" }}>
                            {t("Are you sure you want to delete this form?")}
                        </p>
                        <p style={{ fontWeight: "600", fontSize: "1.05rem", color: "var(--text, #fff)", margin: "0 0 12px 0" }}>
                            "{resolveText(formToDelete.title)}"
                        </p>
                        <p style={{ color: "#ef4444", fontSize: "0.85rem", margin: "0 0 24px 0" }}>
                            {t("This action cannot be undone.")}
                        </p>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                            <button
                                type="button"
                                onClick={closeDeleteModal}
                                disabled={deleting}
                                style={{
                                    background: "transparent",
                                    border: "1px solid var(--border, rgba(255,255,255,0.2))",
                                    color: "var(--text, #fff)",
                                    padding: "8px 18px",
                                    borderRadius: "8px",
                                    cursor: deleting ? "not-allowed" : "pointer",
                                    fontWeight: 500,
                                }}
                            >
                                {t("Cancel")}
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                disabled={deleting}
                                style={{
                                    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                                    color: "#ffffff",
                                    border: "none",
                                    padding: "8px 18px",
                                    borderRadius: "8px",
                                    cursor: deleting ? "not-allowed" : "pointer",
                                    opacity: deleting ? 0.7 : 1,
                                    fontWeight: 600,
                                }}
                            >
                                {deleting ? t("Deleting...") : t("Delete")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}