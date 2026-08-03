import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";

import DashboardLayout from "../components/dashboard/DashboardLayout";
import TopBar from "../components/dashboard/TopBar";
import { getResponsesApi } from "../api/responseApi";

import "./Responses.css";

export default function Responses() {
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedResponse, setSelectedResponse] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [total, setTotal] = useState(0);
    const [searchParams] = useSearchParams();
    const [search, setSearch] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const limit = 20;
    const [offset, setOffset] = useState(0);

    const formId = searchParams.get("id");

    const loadResponses = useCallback(async () => {
        if (!formId) return;

        try {
            setLoading(true);

            const res = await getResponsesApi(
                formId,
                limit,
                offset,
                search,
                startDate,
                endDate
            );

            setResponses(res.data.responses);
            setTotal(res.data.total);
        } catch (err) {
            console.error("Failed to load responses:", err);
            setResponses([]);
        } finally {
            setLoading(false);
        }
    }, [formId, offset]);
    useEffect(() => {
        if (formId) {
            loadResponses();
        }
    }, [
        formId,
        offset,
        search,
        startDate,
        endDate,
    ]);
    return (
        <DashboardLayout>
            <TopBar
                title="Response Browser"
                subtitle="View and inspect submitted responses"
            />
            <div className="response-filters">

                <input
                    type="text"
                    placeholder="🔍 Search responses..."
                    value={search}
                    onChange={(e) => {
                        setOffset(0);
                        setSearch(e.target.value);
                    }}
                />

                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                        setOffset(0);
                        setStartDate(e.target.value);
                    }}
                />

                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                        setOffset(0);
                        setEndDate(e.target.value);
                    }}
                />

            </div>
            <div className="responses-page">
                <h2>Response Browser</h2>

                {loading ? (
                    <p>Loading responses...</p>
                ) : responses.length === 0 ? (
                    <p>No responses found.</p>
                ) : (
                    <>
                        <table className="responses-table">
                            <thead>
                                <tr>
                                    <th>Response ID</th>
                                    <th>Submitted At</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {responses.map((response) => (
                                    <tr key={response.id}>
                                        <td>{response.response_uid}</td>

                                        <td>
                                            {new Date(
                                                response.submitted_at
                                            ).toLocaleString()}
                                        </td>

                                        <td>
                                            <button
                                                onClick={() => {
                                                    setSelectedResponse(
                                                        response
                                                    );
                                                    setShowModal(true);
                                                }}
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

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

                            <span>Page {offset / limit + 1} of {Math.ceil(total / limit)}</span>

                            <button
                                disabled={offset + limit >= total}
                                onClick={() =>
                                    setOffset((prev) => prev + limit)
                                }
                            >
                                Next ▶
                            </button>
                        </div>
                    </>
                )}

                {showModal && selectedResponse && (
                    <div className="modal-overlay">
                        <div className="response-modal">
                            <h2>Response Details</h2>

                            <p>
                                <strong>Response ID:</strong>{" "}
                                {selectedResponse.response_uid}
                            </p>

                            <p>
                                <strong>Submitted:</strong>{" "}
                                {new Date(
                                    selectedResponse.submitted_at
                                ).toLocaleString()}
                            </p>

                            <hr />

                            {Object.entries(
                                selectedResponse.values || {}
                            ).map(([label, value]) => (
                                <div
                                    className="response-field"
                                    key={label}
                                >
                                    <strong>{label}</strong>
                                    <p>{value || "-"}</p>
                                </div>
                            ))}

                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setSelectedResponse(null);
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}