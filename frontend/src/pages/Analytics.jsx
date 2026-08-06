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
} from "recharts";
import { LabelList } from "recharts";
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
    const [searchParams] = useSearchParams();
    const formId = searchParams.get("id");
    const navigate = useNavigate();

    const [analytics, setAnalytics] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState("en");

    useEffect(() => {
        loadAnalytics();
    }, [formId]);

    async function loadAnalytics() {
        try {
            const res = await getAnalyticsApi(formId);
            setAnalytics(res.data);
        } catch (err) {
            console.error(err);
        }
    }

    const barData = [
        {
            name: "Responses",
            value: analytics?.total_submissions || 0,
        },
        {
            name: "Fields",
            value: analytics?.total_fields || 0,
        },
    ];

    const pieData = [
        {
            name: "Completed",
            value: analytics?.completion_rate || 0,
        },
        {
            name: "Remaining",
            value: 100 - (analytics?.completion_rate || 0),
        },
    ];

    return (
        <DashboardLayout>
            <div className="analytics-header">
                <TopBar
                    title="Analytics"
                    subtitle="View performance of this form"
                />

                <div className="analytics-actions">
                    <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "0.9rem" }}>
                        Language
                        <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)}>
                            <option value="en">English (en)</option>
                            <option value="te">Telugu (te)</option>
                        </select>
                    </label>

                    <ExportDropdown formId={formId} />

                    <button
                        className="responses-btn"
                        onClick={() => navigate(`/responses?id=${formId}`)}
                    >
                        📄 Responses
                    </button>
                </div>
            </div>

            <div className="cards">
                <SummaryCard
                    title="Submissions"
                    value={analytics?.total_submissions ?? "--"}
                />

                <SummaryCard
                    title="Completion"
                    value={`${analytics?.completion_rate ?? "--"}%`}
                />

                <SummaryCard
                    title="Average Time"
                    value={`${analytics?.average_completion_time ?? "--"} sec`}
                />

                <SummaryCard
                    title="Fields"
                    value={analytics?.total_fields ?? "--"}
                />
            </div>

            <div className="charts">

                <div className="chart-card">
                    <h3>Overview</h3>

                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={barData}>
                            <XAxis dataKey="name" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Bar
                                dataKey="value"
                                fill="var(--accent)"
                                radius={[8, 8, 0, 0]}
                            />
                            <Bar
                                dataKey="count"
                                fill="var(--accent)"
                                radius={[8, 8, 0, 0]}
                            >
                                <LabelList
                                    dataKey="count"
                                    position="top"
                                />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-card">
                    <h3>Completion</h3>

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
                📊 Question Analytics
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
                            percentage: ((count / total) * 100).toFixed(1),
                        })
                    );

                    return (

                        <div
                            className="chart-card"
                            key={field.field_id}
                            style={{ marginBottom: "30px" }}
                        >

                            <div className="chart-heading">
                                <h3>{resolveFieldLabel(field, selectedLanguage)}</h3>

                                <p>
                                    {field.type === "dropdown"
                                        ? "Distribution of selected options"
                                        : "Distribution of ratings"}
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
                                            bottom: 0
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

                <p>No dropdown or rating analytics available.</p>

            )}

        </DashboardLayout>
    );
}