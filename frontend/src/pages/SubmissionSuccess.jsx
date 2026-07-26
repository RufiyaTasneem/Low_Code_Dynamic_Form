import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./SubmissionSuccess.css";

const SubmissionSuccess = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const [isCopying, setIsCopying] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopyResponseId = async () => {
        if (!state?.responseId || isCopying) return;

        setIsCopying(true);

        try {
            await navigator.clipboard.writeText(state.responseId);
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
                setIsCopying(false);
            }, 2000);
        } catch (error) {
            console.error("Failed to copy response ID:", error);
            setIsCopying(false);
        }
    };

    if (!state) {
        return (
            <div className="success-container">
                <div className="success-card">
                    <h2>Invalid Access</h2>
                    <button onClick={() => navigate("/")}>
                        Back Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="success-container">
            <div className="success-card">

                <div className="success-icon">
                    ✓
                </div>

                <h1>Thank You!</h1>

                <p className="subtitle">
                    Your response has been submitted successfully.
                </p>

                <div className="success-details">

                    <div className="detail-row">
                        <span>Response ID</span>
                        <div className="detail-value-group">
                            <strong>{state.responseId}</strong>
                            <button
                                type="button"
                                className="copy-btn"
                                onClick={handleCopyResponseId}
                                disabled={isCopying}
                            >
                                {isCopying ? (
                                    <span className="copy-spinner" aria-hidden="true" />
                                ) : null}
                                {isCopying ? "Copying..." : "Copy Response ID"}
                            </button>
                            {copied && <span className="copy-feedback">Copied!</span>}
                        </div>
                    </div>

                    <div className="detail-row">
                        <span>Submitted At</span>
                        <strong>
                            {state.submittedAt
                                ? new Date(state.submittedAt).toLocaleString()
                                : "-"}
                        </strong>
                    </div>

                    <div className="detail-row">
                        <span>Form</span>
                        <strong>{state.formTitle}</strong>
                    </div>

                </div>

                <div className="info-box">
                    Please save your <b>Response ID</b> for future reference.
                </div>

                <div className="success-buttons">

                    <button
                        className="primary-btn"
                        onClick={() => navigate("/")}
                    >
                        Back Home
                    </button>

                    <button
                        className="secondary-btn"
                        onClick={() => navigate(-1)}
                    >
                        Submit Another Response
                    </button>

                </div>

            </div>
        </div>
    );
};

export default SubmissionSuccess;