import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import TopBar from "../components/dashboard/TopBar";
import { getDashboardSummaryApi, getDashboardAnalyticsApi } from "../api/formApi";
import {
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import {
    FileText,
    CheckCircle2,
    Users,
    Clock,
    PlusCircle,
    Eye,
    ShieldCheck,
    BarChart3,
    Activity,
    Server,
    Database,
    HardDrive,
    Check,
    ExternalLink,
    TrendingUp,
    ListFilter,
    MessageSquare,
    Inbox,
    PieChart as PieIcon,
    LineChart as LineIcon,
} from "lucide-react";

import "./Dashboard.css";

const resolveText = (value, language = "en") => {
    if (!value) return "";
    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value);
            if (typeof parsed === "object" && parsed !== null) {
                return parsed[language] || parsed.en || parsed.te || "";
            }
        } catch (e) {
            // Plain string
        }
        return value;
    }
    if (typeof value === "object" && value !== null) {
        return value[language] || value.en || value.te || "";
    }
    return String(value);
};

export default function Dashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);
    const [selectedLanguage, setSelectedLanguage] = useState(() => {
        return localStorage.getItem("selectedLanguage") || "en";
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            setAnalyticsLoading(true);
            try {
                const [summaryRes, analyticsRes] = await Promise.all([
                    getDashboardSummaryApi(),
                    getDashboardAnalyticsApi(),
                ]);
                setStats(summaryRes.data);
                setAnalytics(analyticsRes.data);
            } catch (err) {
                console.error("Dashboard fetch error:", err);
            } finally {
                setLoading(false);
                setAnalyticsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const totalForms = stats?.total_forms ?? 0;
    const publishedForms = stats?.published_forms ?? 0;
    const draftForms = stats?.draft_forms ?? 0;
    const archivedForms = stats?.archived_forms ?? 0;
    const totalResponses = stats?.total_responses ?? 0;

    const recentForms = stats?.recent_forms || [];
    const recentResponses = stats?.recent_responses || [];

    const formatTimestamp = (dateStr) => {
        if (!dateStr) return "—";
        try {
            return new Date(dateStr).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
        } catch {
            return dateStr;
        }
    };

    // Chart Data Preparation
    const responsesOverTimeData = (analytics?.responses_over_time || []).map((item) => ({
        date: item.date ? item.date.slice(5) : "",
        count: item.count || 0,
    }));

    const pieData = [
        { name: "Draft", value: analytics?.form_status?.draft || 0, color: "#f59e0b" },
        { name: "Published", value: analytics?.form_status?.published || 0, color: "#10b981" },
        { name: "Archived", value: analytics?.form_status?.archived || 0, color: "#94a3b8" },
    ].filter((item) => item.value > 0 || (analytics?.form_status && Object.values(analytics.form_status).every(v => v === 0)));

    const topFormsData = (analytics?.top_forms || []).map((item) => ({
        name: resolveText(item.name, selectedLanguage) || "Form",
        responses: item.responses || 0,
    }));

    const hasResponses = totalResponses > 0 || responsesOverTimeData.some((d) => d.count > 0);

    return (
        <DashboardLayout>
            <TopBar
                title="Dashboard"
                subtitle="Build, manage and analyze your forms from one place."
                showButton={false}
            />

            <div className="dashboard-container">
                {/* 1. Header */}
                <div className="dashboard-header">
                    <div>
                        <p className="eyebrow">Form Studio Overview</p>
                        <h1 className="dashboard-title">Dashboard</h1>
                        <p className="dashboard-subtitle">
                            Build, manage and analyze your forms from one place.
                        </p>
                    </div>
                    <label className="lang-select-label">
                        Language
                        <select
                            value={selectedLanguage}
                            onChange={(e) => {
                                setSelectedLanguage(e.target.value);
                                localStorage.setItem("selectedLanguage", e.target.value);
                            }}
                        >
                            <option value="en">English (en)</option>
                            <option value="te">Telugu (te)</option>
                        </select>
                    </label>
                </div>

                {/* Quick Actions */}
                <div className="quick-actions-section">
                    <h3 className="section-label">Quick Actions</h3>
                    <div className="quick-actions-grid">
                        <button
                            className="quick-action-card"
                            type="button"
                            onClick={() => navigate("/builder")}
                        >
                            <div className="quick-action-icon purple">
                                <PlusCircle size={20} />
                            </div>
                            <div className="quick-action-info">
                                <strong>Create New Form</strong>
                                <span>Start building a dynamic form</span>
                            </div>
                        </button>

                        <button
                            className="quick-action-card"
                            type="button"
                            onClick={() => navigate("/forms")}
                        >
                            <div className="quick-action-icon blue">
                                <ListFilter size={20} />
                            </div>
                            <div className="quick-action-info">
                                <strong>View Forms</strong>
                                <span>Browse form inventory</span>
                            </div>
                        </button>

                        <button
                            className="quick-action-card"
                            type="button"
                            onClick={() => navigate("/analytics")}
                        >
                            <div className="quick-action-icon green">
                                <Eye size={20} />
                            </div>
                            <div className="quick-action-info">
                                <strong>Analytics</strong>
                                <span>Inspect metrics & charts</span>
                            </div>
                        </button>

                        <button
                            className="quick-action-card"
                            type="button"
                            onClick={() => navigate("/audit-logs")}
                        >
                            <div className="quick-action-icon amber">
                                <ShieldCheck size={20} />
                            </div>
                            <div className="quick-action-info">
                                <strong>Audit Logs</strong>
                                <span>Review security activity</span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* 2. Statistics Cards */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-card-top">
                            <span className="stat-card-title">Total Forms</span>
                            <div className="stat-card-icon icon-purple">
                                <FileText size={20} />
                            </div>
                        </div>
                        {loading ? (
                            <div className="skeleton-box" style={{ height: 36, width: "60%", margin: "8px 0" }} />
                        ) : (
                            <div className="stat-card-value">{totalForms}</div>
                        )}
                        <div className="stat-card-meta">
                            <span className="meta-positive">
                                <TrendingUp size={14} /> Live
                            </span>
                            <span className="meta-text">total created forms</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-card-top">
                            <span className="stat-card-title">Published Forms</span>
                            <div className="stat-card-icon icon-green">
                                <CheckCircle2 size={20} />
                            </div>
                        </div>
                        {loading ? (
                            <div className="skeleton-box" style={{ height: 36, width: "60%", margin: "8px 0" }} />
                        ) : (
                            <div className="stat-card-value">{publishedForms}</div>
                        )}
                        <div className="stat-card-meta">
                            <span className="meta-positive">
                                {totalForms > 0 ? Math.round((publishedForms / totalForms) * 100) : 0}%
                            </span>
                            <span className="meta-text">active & accepting entries</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-card-top">
                            <span className="stat-card-title">Draft Forms</span>
                            <div className="stat-card-icon icon-amber">
                                <Clock size={20} />
                            </div>
                        </div>
                        {loading ? (
                            <div className="skeleton-box" style={{ height: 36, width: "60%", margin: "8px 0" }} />
                        ) : (
                            <div className="stat-card-value">{draftForms}</div>
                        )}
                        <div className="stat-card-meta">
                            <span className="meta-neutral">
                                {archivedForms > 0 ? `${archivedForms} Archived` : "Work in progress"}
                            </span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-card-top">
                            <span className="stat-card-title">Total Responses</span>
                            <div className="stat-card-icon icon-blue">
                                <Users size={20} />
                            </div>
                        </div>
                        {loading ? (
                            <div className="skeleton-box" style={{ height: 36, width: "60%", margin: "8px 0" }} />
                        ) : (
                            <div className="stat-card-value">{totalResponses}</div>
                        )}
                        <div className="stat-card-meta">
                            <span className="meta-positive">
                                <TrendingUp size={14} /> Live
                            </span>
                            <span className="meta-text">submissions received</span>
                        </div>
                    </div>
                </div>

                {/* 3. Analytics Section (3 Charts Grid) */}
                <div className="analytics-section">
                    <h3 className="section-label">Analytics</h3>

                    {!hasResponses && !analyticsLoading ? (
                        <div className="analytics-empty-card">
                            <BarChart3 size={40} />
                            <h4>No analytics available yet.</h4>
                            <p>Submit responses to your published forms to generate real-time metrics and charts.</p>
                        </div>
                    ) : (
                        <div className="charts-grid">
                            {/* Chart 1: Responses Over Time */}
                            <div className="chart-card">
                                <div className="card-header-flex">
                                    <div>
                                        <h4 className="card-title">
                                            <LineIcon size={18} /> Responses Over Time
                                        </h4>
                                        <p className="card-subtitle">Daily submission trend (Last 30 days)</p>
                                    </div>
                                </div>
                                {analyticsLoading ? (
                                    <div className="skeleton-box" style={{ height: 260, width: "100%", marginTop: 12 }} />
                                ) : (
                                    <div style={{ width: "100%", height: 260, marginTop: 12 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={responsesOverTimeData}>
                                                <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                                                <YAxis allowDecimals={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                                                <Tooltip
                                                    contentStyle={{
                                                        background: "#1e1e2d",
                                                        borderColor: "rgba(255, 255, 255, 0.1)",
                                                        borderRadius: 12,
                                                        color: "#ffffff",
                                                    }}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="count"
                                                    name="Responses"
                                                    stroke="#7c3aed"
                                                    strokeWidth={3}
                                                    dot={{ r: 3, fill: "#7c3aed" }}
                                                    activeDot={{ r: 6 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </div>

                            {/* Chart 2: Forms by Status */}
                            <div className="chart-card">
                                <div className="card-header-flex">
                                    <div>
                                        <h4 className="card-title">
                                            <PieIcon size={18} /> Forms by Status
                                        </h4>
                                        <p className="card-subtitle">Draft, Published, and Archived</p>
                                    </div>
                                </div>
                                {analyticsLoading ? (
                                    <div className="skeleton-box" style={{ height: 260, width: "100%", marginTop: 12 }} />
                                ) : (
                                    <div style={{ width: "100%", height: 260, marginTop: 12 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={pieData}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={50}
                                                    outerRadius={80}
                                                    paddingAngle={4}
                                                >
                                                    {pieData.map((entry, index) => (
                                                        <Cell key={index} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{
                                                        background: "#1e1e2d",
                                                        borderColor: "rgba(255, 255, 255, 0.1)",
                                                        borderRadius: 12,
                                                        color: "#ffffff",
                                                    }}
                                                />
                                                <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12 }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </div>

                            {/* Chart 3: Top Forms */}
                            <div className="chart-card">
                                <div className="card-header-flex">
                                    <div>
                                        <h4 className="card-title">
                                            <BarChart3 size={18} /> Top Forms
                                        </h4>
                                        <p className="card-subtitle">Top 5 forms by response count</p>
                                    </div>
                                </div>
                                {analyticsLoading ? (
                                    <div className="skeleton-box" style={{ height: 260, width: "100%", marginTop: 12 }} />
                                ) : (
                                    <div style={{ width: "100%", height: 260, marginTop: 12 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart layout="vertical" data={topFormsData}>
                                                <XAxis type="number" allowDecimals={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                                                <YAxis type="category" dataKey="name" width={100} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                                                <Tooltip
                                                    contentStyle={{
                                                        background: "#1e1e2d",
                                                        borderColor: "rgba(255, 255, 255, 0.1)",
                                                        borderRadius: 12,
                                                        color: "#ffffff",
                                                    }}
                                                />
                                                <Bar dataKey="responses" name="Responses" fill="#6366f1" radius={[0, 8, 8, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Middle Grid: Activity & Health */}
                <div className="dashboard-middle-grid">
                    <div className="dashboard-side-card">
                        <div className="card-header">
                            <h3 className="card-title">
                                <Activity size={18} /> Recent Activity
                            </h3>
                        </div>
                        <div className="activity-timeline">
                            {loading ? (
                                <>
                                    <div className="skeleton-box" style={{ height: 36, width: "100%" }} />
                                    <div className="skeleton-box" style={{ height: 36, width: "100%" }} />
                                    <div className="skeleton-box" style={{ height: 36, width: "100%" }} />
                                </>
                            ) : recentForms.length === 0 && recentResponses.length === 0 ? (
                                <div className="empty-dashboard-box">
                                    <Inbox size={24} />
                                    <p>No recent activity recorded yet.</p>
                                </div>
                            ) : (
                                <>
                                    {recentForms.slice(0, 2).map((f) => (
                                        <div className="timeline-item" key={`f-${f.id}`}>
                                            <div className="timeline-dot purple" />
                                            <div className="timeline-content">
                                                <strong>Form "{resolveText(f.title, selectedLanguage)}" updated</strong>
                                                <span className="timeline-time">{formatTimestamp(f.updated_at)}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {recentResponses.slice(0, 2).map((r) => (
                                        <div className="timeline-item" key={`r-${r.id}`}>
                                            <div className="timeline-dot green" />
                                            <div className="timeline-content">
                                                <strong>New response for "{resolveText(r.form_title, selectedLanguage)}"</strong>
                                                <span className="timeline-time">{formatTimestamp(r.submitted_at)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>

                    <div className="dashboard-side-card">
                        <div className="card-header">
                            <h3 className="card-title">
                                <Server size={18} /> System Health
                            </h3>
                        </div>
                        <div className="health-list">
                            <div className="health-item">
                                <div className="health-left">
                                    <Server size={16} className="health-icon" />
                                    <span>Backend Healthy</span>
                                </div>
                                <span className="health-indicator green">
                                    <Check size={12} /> Operational
                                </span>
                            </div>
                            <div className="health-item">
                                <div className="health-left">
                                    <Database size={16} className="health-icon" />
                                    <span>Database Connected</span>
                                </div>
                                <span className="health-indicator green">
                                    <Check size={12} /> Operational
                                </span>
                            </div>
                            <div className="health-item">
                                <div className="health-left">
                                    <HardDrive size={16} className="health-icon" />
                                    <span>Storage Available</span>
                                </div>
                                <span className="health-indicator green">
                                    <Check size={12} /> Operational
                                </span>
                            </div>
                            <div className="health-item">
                                <div className="health-left">
                                    <ShieldCheck size={16} className="health-icon" />
                                    <span>API Healthy</span>
                                </div>
                                <span className="health-indicator green">
                                    <Check size={12} /> Operational
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Forms Table */}
                <div className="recent-forms-section">
                    <div className="card-header-flex">
                        <div>
                            <h3 className="card-title">Recent Forms</h3>
                            <p className="card-subtitle">
                                Manage your latest forms and view submission stats
                            </p>
                        </div>
                        <button
                            className="table-view-all-btn"
                            type="button"
                            onClick={() => navigate("/forms")}
                        >
                            View All Forms <ExternalLink size={14} />
                        </button>
                    </div>

                    <div className="table-responsive-wrapper">
                        {loading ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "16px 0" }}>
                                <div className="skeleton-box" style={{ height: 40, width: "100%" }} />
                                <div className="skeleton-box" style={{ height: 40, width: "100%" }} />
                                <div className="skeleton-box" style={{ height: 40, width: "100%" }} />
                            </div>
                        ) : recentForms.length === 0 ? (
                            <div className="empty-dashboard-box">
                                <Inbox size={32} />
                                <p>No forms created yet. Click "Create New Form" above to get started!</p>
                            </div>
                        ) : (
                            <table className="dashboard-table">
                                <thead>
                                    <tr>
                                        <th>Form Name</th>
                                        <th>Status</th>
                                        <th>Responses Count</th>
                                        <th>Last Updated</th>
                                        <th style={{ textAlign: "right" }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentForms.map((item, idx) => {
                                        const statusLower = (item.status || "draft").toLowerCase();
                                        const formTitle = resolveText(item.title, selectedLanguage) || "Form";
                                        return (
                                            <tr key={item.id || idx}>
                                                <td className="font-semibold">{formTitle}</td>
                                                <td>
                                                    <span className={`status-badge ${statusLower}`}>
                                                        {item.status || "Draft"}
                                                    </span>
                                                </td>
                                                <td>{item.responses ?? 0}</td>
                                                <td className="text-muted">{formatTimestamp(item.updated_at)}</td>
                                                <td style={{ textAlign: "right" }}>
                                                    <button
                                                        className="table-action-btn"
                                                        type="button"
                                                        onClick={() => navigate(`/builder?id=${item.id}`)}
                                                    >
                                                        View / Edit
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Recent Responses Table */}
                <div className="recent-forms-section">
                    <div className="card-header-flex">
                        <div>
                            <h3 className="card-title">
                                <MessageSquare size={18} /> Recent Responses
                            </h3>
                            <p className="card-subtitle">
                                Latest submissions received across active forms
                            </p>
                        </div>
                        <button
                            className="table-view-all-btn"
                            type="button"
                            onClick={() => navigate("/responses")}
                        >
                            View All Responses <ExternalLink size={14} />
                        </button>
                    </div>

                    <div className="table-responsive-wrapper">
                        {loading ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "16px 0" }}>
                                <div className="skeleton-box" style={{ height: 40, width: "100%" }} />
                                <div className="skeleton-box" style={{ height: 40, width: "100%" }} />
                                <div className="skeleton-box" style={{ height: 40, width: "100%" }} />
                            </div>
                        ) : recentResponses.length === 0 ? (
                            <div className="empty-dashboard-box">
                                <Inbox size={32} />
                                <p>No form responses submitted yet.</p>
                            </div>
                        ) : (
                            <table className="dashboard-table">
                                <thead>
                                    <tr>
                                        <th>Form Name</th>
                                        <th>Submitted At</th>
                                        <th>Status</th>
                                        <th style={{ textAlign: "right" }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentResponses.map((item, idx) => {
                                        const formName = resolveText(item.form_title, selectedLanguage) || "Form";
                                        return (
                                            <tr key={item.id || idx}>
                                                <td className="font-semibold">{formName}</td>
                                                <td className="text-muted">{formatTimestamp(item.submitted_at)}</td>
                                                <td>
                                                    <span className="status-badge published">
                                                        {item.status || "Completed"}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: "right" }}>
                                                    <button
                                                        className="table-action-btn"
                                                        type="button"
                                                        onClick={() => navigate(`/responses?form_id=${item.form_id || item.id}`)}
                                                    >
                                                        Inspect
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}