import { useEffect, useState } from "react";
import API from "../services/api";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import TopBar from "../components/dashboard/TopBar";
import "./AuditLogs.css";

export default function AuditLogs() {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const res = await API.get("/audit-logs");
            setLogs(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <DashboardLayout>
            <TopBar />

            <div className="audit-container">
                <h2>Audit Logs</h2>

                <table className="audit-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Action</th>
                            <th>Form</th>
                            <th>Details</th>
                            <th>Date</th>
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
            </div>
        </DashboardLayout>
    );
}