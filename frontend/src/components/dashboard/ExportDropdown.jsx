import { useState } from "react";
import { exportCSVApi, exportJSONApi } from "../../api/exportApi";
import "./ExportDropdown.css";

export default function ExportDropdown({ formId }) {
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
            console.log("Headers:", res.headers);
            console.log("Content-Disposition:", res.headers["content-disposition"]);
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
                {loading ? "⏳ Downloading..." : "⬇ Export"}
            </button>

            {open && (
                <div className="dropdown-menu">

                    <button
                        disabled={loading}
                        onClick={() => downloadFile("csv")}
                    >
                        📄 Export as CSV
                    </button>

                    <button
                        disabled={loading}
                        onClick={() => downloadFile("json")}
                    >
                        🗂 Export as JSON
                    </button>

                </div>
            )}
        </div>
    );
}