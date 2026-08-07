import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import API from "../services/api";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import TopBar from "../components/dashboard/TopBar";
import "./AuditLogs.css";

export default function AuditLogs() {
    const { t } = useTranslation();
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const res = await API.get("/audit-logs");
            setLogs(res.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <DashboardLayout>
            <TopBar title={t("Audit Logs")} subtitle="Track application activities" />

            <div className="audit-container">
                <h2>{t("Audit Logs")}</h2>

                {logs.length === 0 ? (
                    <div className="empty-state">{t("No logs found")}</div>
                ) : (
                    <table className="audit-table">
                        <thead>
                            <tr>
                                <th>{t("User")}</th>
                                <th>{t("Action")}</th>
                                <th>{t("Forms")}</th>
                                <th>{t("Details")}</th>
                                <th>{t("Timestamp")}</th>
                            </tr>
                        </thead>

                        <tbody>
                            {logs.map((log) => (
                                <tr key={log.id}>
                                    <td>{log.user}</td>
                                    <td>{log.action}</td>
                                    <td>{log.form}</td>
                                    <td>{log.details}</td>
                                    <td>{log.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </DashboardLayout>
    );
}