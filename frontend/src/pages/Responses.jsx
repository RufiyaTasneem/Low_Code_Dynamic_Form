import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import TopBar from "../components/dashboard/TopBar";
import {
    getResponsesApi,
    bulkDeleteResponsesApi,
} from "../api/responseApi";

import "./Responses.css";

export default function Responses() {
    const { t } = useTranslation();
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedResponse, setSelectedResponse] = useState(null);
    const [selectedResponses, setSelectedResponses] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [total, setTotal] = useState(0);
    const [searchParams] = useSearchParams();
    const [search, setSearch] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const limit = 50;
    const [offset, setOffset] = useState(0);

    const formId = searchParams.get("id");

    const loadResponses = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const res = await getResponsesApi(
                formId,
                limit,
                offset,
                search,
                startDate,
                endDate
            );

            setResponses(res.data?.responses || []);
            setTotal(res.data?.total || 0);
        } catch (err) {
            console.error("Failed to load responses - HTTP Status:", err.response?.status);
            console.error("Failed to load responses - Response Data:", err.response?.data);
            console.error("Failed to load responses - URL:", err.config?.url);
            console.error("Failed to load responses - Params:", err.config?.params);
            setError(t("Failed to load responses. Please try again."));
            setResponses([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }, [formId, offset, search, startDate, endDate, t]);

    useEffect(() => {
        loadResponses();
    }, [loadResponses]);

    const deleteSelectedResponses = async () => {
        if (selectedResponses.length === 0) {
            return;
        }

        try {
            await bulkDeleteResponsesApi(formId, selectedResponses);
            setShowDeleteModal(false);
            setSelectedResponses([]);
            await loadResponses();
            alert(t("Responses deleted successfully."));
        } catch (err) {
            console.error("Failed to delete responses:", err);
            alert(t("Failed to delete selected responses. Please try again."));
        }
    };

    const hasActiveFilters = Boolean(search || startDate || endDate);

    const formatDate = (isoStr) => {
        if (!isoStr) return "";
        try {
            const d = new Date(isoStr);
            if (isNaN(d.getTime())) return isoStr;
            return d.toLocaleString();
        } catch (e) {
            return isoStr;
        }
    };

    return (
        <DashboardLayout>
            <TopBar
                title="Response Browser"
                subtitle="View and inspect submitted responses"
            />
            <div className="response-filters">
                <input
                    type="text"
                    placeholder={`🔍 ${t("Search responses...")}`}
                    value={search}
                    onChange={(e) => {
                        setOffset(0);
                        setSearch(e.target.value);
                    }}
                />

                <input
                    type="date"
                    value={startDate}
                    title={t("Start Date")}
                    onChange={(e) => {
                        setOffset(0);
                        setStartDate(e.target.value);
                    }}
                />

                <input
                    type="date"
                    value={endDate}
                    title={t("End Date")}
                    onChange={(e) => {
                        setOffset(0);
                        setEndDate(e.target.value);
                    }}
                />
            </div>

            <div className="responses-page">
                <h2>{t("Responses")}</h2>
                <div className="bulk-actions">
                    <button
                        className="delete-selected-btn"
                        disabled={selectedResponses.length === 0}
                        onClick={() => setShowDeleteModal(true)}
                    >
                        🗑 {t("Delete")} ({selectedResponses.length})
                    </button>
                </div>

                {error ? (
                    <div className="empty-state" style={{ color: "#ef4444" }}>
                        {error}
                    </div>
                ) : loading ? (
                    <p>{t("Loading...")}</p>
                ) : responses.length === 0 ? (
                    <div className="empty-state">
                        {hasActiveFilters
                            ? t("No responses found for the selected date range.")
                            : t("No responses found.")}
                    </div>
                ) : (
                    <>
                        <table className="responses-table">
                            <thead>
                                <tr>
                                    <th>
                                        <input
                                            type="checkbox"
                                            checked={
                                                responses.length > 0 &&
                                                selectedResponses.length === responses.length
                                            }
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedResponses(
                                                        responses.map((r) => r.id)
                                                    );
                                                } else {
                                                    setSelectedResponses([]);
                                                }
                                            }}
                                        />
                                    </th>

                                    <th>{t("Form Title")}</th>
                                    <th>Response ID</th>
                                    <th>{t("Submitted On")}</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {responses.map((response) => (
                                    <tr key={response.id}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedResponses.includes(response.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedResponses([
                                                            ...selectedResponses,
                                                            response.id,
                                                        ]);
                                                    } else {
                                                        setSelectedResponses(
                                                            selectedResponses.filter(
                                                                (id) => id !== response.id
                                                            )
                                                        );
                                                    }
                                                }}
                                            />
                                        </td>
                                        <td>
                                            <strong>{response.form_title || `Form #${response.form_id}`}</strong>
                                        </td>
                                        <td>{response.response_uid}</td>

                                        <td>
                                            {formatDate(response.submitted_at)}
                                        </td>

                                        <td>
                                            <button
                                                className="view-btn"
                                                onClick={() => {
                                                    setSelectedResponse(response);
                                                    setShowModal(true);
                                                }}
                                            >
                                                {t("View")}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {total > limit && (
                            <div className="pagination">
                                <button
                                    disabled={offset === 0}
                                    onClick={() =>
                                        setOffset((prev) =>
                                            Math.max(prev - limit, 0)
                                        )
                                    }
                                >
                                    ◀ Previous
                                </button>

                                <span>
                                    Page {Math.floor(offset / limit) + 1} of{" "}
                                    {Math.ceil(total / limit)}
                                </span>

                                <button
                                    disabled={offset + limit >= total}
                                    onClick={() =>
                                        setOffset((prev) => prev + limit)
                                    }
                                >
                                    Next ▶
                                </button>
                            </div>
                        )}
                    </>
                )}

                {showModal && selectedResponse && (
                    <div className="modal-overlay">
                        <div className="response-modal">
                            <h2>Response Details</h2>

                            <p>
                                <strong>{t("Form Title")}:</strong>{" "}
                                {selectedResponse.form_title || `Form #${selectedResponse.form_id}`}
                            </p>

                            <p>
                                <strong>Response ID:</strong>{" "}
                                {selectedResponse.response_uid}
                            </p>

                            <p>
                                <strong>{t("Submitted On")}:</strong>{" "}
                                {formatDate(selectedResponse.submitted_at)}
                            </p>

                            <hr style={{ margin: "16px 0", borderColor: "var(--border)" }} />

                            <h3>Submitted Values</h3>
                            {selectedResponse.values &&
                            Object.keys(selectedResponse.values).length > 0 ? (
                                <div style={{ display: "grid", gap: "12px", marginTop: "12px" }}>
                                    {Object.entries(selectedResponse.values).map(
                                        ([fieldLabel, val]) => (
                                            <div
                                                key={fieldLabel}
                                                style={{
                                                    background: "var(--surface-muted)",
                                                    padding: "10px 14px",
                                                    borderRadius: "8px",
                                                    border: "1px solid var(--border)",
                                                }}
                                            >
                                                <strong style={{ color: "var(--text-subtle)", fontSize: "0.85rem" }}>
                                                    {fieldLabel}
                                                </strong>
                                                <p style={{ margin: "4px 0 0 0", color: "var(--text)", fontWeight: 500 }}>
                                                    {String(val)}
                                                </p>
                                            </div>
                                        )
                                    )}
                                </div>
                            ) : (
                                <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
                                    No value details recorded.
                                </p>
                            )}

                            <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end" }}>
                                <button
                                    className="close-btn"
                                    onClick={() => {
                                        setShowModal(false);
                                        setSelectedResponse(null);
                                    }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showDeleteModal && (
                    <div className="modal-overlay">
                        <div className="response-modal">
                            <h2>Delete Responses</h2>
                            <p style={{ marginTop: "12px", color: "var(--text-muted)" }}>
                                Are you sure you want to delete {selectedResponses.length} selected response(s)?
                            </p>
                            <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                                <button
                                    className="close-btn"
                                    onClick={() => setShowDeleteModal(false)}
                                >
                                    {t("Cancel")}
                                </button>
                                <button
                                    className="delete-selected-btn"
                                    onClick={deleteSelectedResponses}
                                >
                                    {t("Delete")}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}