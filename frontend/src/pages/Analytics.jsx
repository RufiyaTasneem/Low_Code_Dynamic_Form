import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend,
    LabelList,
} from "recharts";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";
import ExportDropdown from "../components/dashboard/ExportDropdown";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import TopBar from "../components/dashboard/TopBar";
import SummaryCard from "../components/dashboard/SummaryCard";
import { getAnalyticsApi } from "../api/analyticsApi";

import "./Analytics.css";

const COLORS = [
    "var(--accent)",
    "var(--success)",
    "var(--warning)",
    "var(--danger)",
    "var(--accent-2)",
    "var(--surface)",
];

const resolveFieldLabel = (field, language = "en") => {
    if (typeof field?.label === "string") {
        return field.label;
    }

    return field?.label?.[language] || field?.label?.en || "";
};

export default function Analytics() {
    const { t, i18n } = useTranslation();
    const [searchParams] = useSearchParams();
    const formId = searchParams.get("id");
    const navigate = useNavigate();

    const [analytics, setAnalytics] = useState(null);

    useEffect(() => {
        if (!formId) return;

        getAnalyticsApi(formId)
            .then((res) => {
                setAnalytics(res.data);
            })
            .catch((err) => console.error(err));
    }, [formId]);

    if (!analytics) return <div className="loading">{t("Loading...")}</div>;

    const barData = [
        {
            name: t("Submissions"),
            value: analytics?.total_submissions ?? analytics?.total_responses ?? 0,
        },
        {
            name: t("Completion"),
            value: analytics?.completed_responses ?? 0,
        },
    ];

    const pieData = [
        { name: t("Completion Rate"), value: analytics?.completion_rate ?? 0 },
        {
            name: "Remaining",
            value: 100 - (analytics?.completion_rate ?? 0),
        },
    ];

    return (
        <DashboardLayout>
            <TopBar
                title={t("Analytics")}
                subtitle={t("View form performance and metrics")}
            />

            <div className="analytics-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
                <button
                    className="responses-btn"
                    onClick={() => navigate(`/responses?id=${formId}`)}
                >
                    📄 {t("Responses")}
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <LanguageSwitcher />
                    <ExportDropdown formId={formId} />
                </div>
            </div>

            <div className="cards">
                <SummaryCard
                    title={t("Submissions")}
                    value={analytics?.total_submissions ?? analytics?.total_responses ?? "--"}
                />

                <SummaryCard
                    title={t("Completion")}
                    value={`${analytics?.completion_rate ?? "--"}%`}
                />

                <SummaryCard
                    title={t("Average Time")}
                    value={`${analytics?.average_completion_time ?? "--"} sec`}
                />

                <SummaryCard
                    title={t("Fields")}
                    value={analytics?.total_fields ?? "--"}
                />
            </div>

            <div className="charts">
                <div className="chart-card">
                    <h3>{t("Overview")}</h3>

                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={barData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Bar
                                dataKey="value"
                                fill="var(--accent)"
                                radius={[8, 8, 0, 0]}
                            >
                                <LabelList
                                    dataKey="value"
                                    position="top"
                                />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-card">
                    <h3>{t("Completion")}</h3>

                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                dataKey="value"
                                outerRadius={110}
                                innerRadius={55}
                            >
                                <Cell fill="var(--accent)" />
                                <Cell fill="var(--surface)" />
                            </Pie>

                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <h2 className="analytics-title">
                📊 {t("Question Analytics")}
            </h2>

            {analytics?.field_distributions?.length > 0 ? (
                analytics.field_distributions.map((field) => {
                    const total = Object.values(field.distribution).reduce(
                        (a, b) => a + b,
                        0
                    );

                    const chartData = Object.entries(field.distribution).map(
                        ([label, count]) => ({
                            label,
                            count,
                            percentage: total > 0 ? ((count / total) * 100).toFixed(1) : 0,
                        })
                    );

                    return (
                        <div
                            className="chart-card"
                            key={field.field_id}
                            style={{ marginBottom: "30px" }}
                        >
                            <div className="chart-heading">
                                <h3>{resolveFieldLabel(field, i18n.language || "en")}</h3>

                                <p>
                                    {field.type === "dropdown"
                                        ? t("Distribution of selected options")
                                        : t("Distribution of ratings")}
                                </p>
                            </div>

                            {field.type === "dropdown" ? (
                                <ResponsiveContainer width="100%" height={320}>
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            dataKey="count"
                                            nameKey="label"
                                            outerRadius={110}
                                            innerRadius={55}
                                            label={({ percent }) =>
                                                `${(percent * 100).toFixed(0)}%`
                                            }
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell
                                                    key={index}
                                                    fill={COLORS[index % COLORS.length]}
                                                />
                                            ))}
                                        </Pie>

                                        <Tooltip />

                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <ResponsiveContainer width="100%" height={320}>
                                    <BarChart
                                        data={chartData}
                                        margin={{
                                            top: 20,
                                            right: 20,
                                            left: 0,
                                            bottom: 0,
                                        }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />

                                        <XAxis dataKey="label" />

                                        <YAxis />

                                        <Tooltip />

                                        <Bar
                                            dataKey="count"
                                            fill="var(--accent)"
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    );
                })
            ) : (
                <p>{t("No dropdown or rating analytics available.")}</p>
            )}
        </DashboardLayout>
    );
}