import { useState } from "react";
import { useTranslation } from "react-i18next";
import { exportCSVApi, exportJSONApi } from "../../api/exportApi";
import "./ExportDropdown.css";

export default function ExportDropdown({ formId }) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const downloadFile = async (type) => {
        try {
            setLoading(true);

            const res =
                type === "csv"
                    ? await exportCSVApi(formId)
                    : await exportJSONApi(formId);

            const blob = new Blob([res.data], {
                type:
                    type === "csv"
                        ? "text/csv"
                        : "application/json",
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            const disposition = res.headers["content-disposition"];

            let filename = `form_${formId}.${type}`;

            if (disposition) {
                const match = disposition.match(/filename="?([^"]+)"?/);
                if (match) {
                    filename = match[1];
                }
            }

            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            alert(`${type.toUpperCase()} exported successfully!`);
        } catch (err) {
            console.error(err);
            alert("Export failed.");
        } finally {
            setLoading(false);
            setOpen(false);
        }
    };

    return (
        <div className="export-dropdown">
            <button
                className="export-btn"
                onClick={() => setOpen(!open)}
                disabled={loading}
            >
                {loading ? `⏳ ${t("Downloading...")}` : `⬇ ${t("Export")}`}
            </button>

            {open && (
                <div className="dropdown-menu">
                    <button
                        disabled={loading}
                        onClick={() => downloadFile("csv")}
                    >
                        📄 {t("Export CSV")}
                    </button>

                    <button
                        disabled={loading}
                        onClick={() => downloadFile("json")}
                    >
                        🗂 {t("Export JSON")}
                    </button>
                </div>
            )}
        </div>
    );
}