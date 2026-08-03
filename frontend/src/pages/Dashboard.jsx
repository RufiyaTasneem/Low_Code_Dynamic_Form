import { useEffect, useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import { getMyFormsApi } from "../api/formApi";
import ExportDropdown from "../components/dashboard/ExportDropdown";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import TopBar from "../components/dashboard/TopBar";
import SummaryCard from "../components/dashboard/SummaryCard";
import { getAnalyticsApi } from "../api/analyticsApi";

import "./Dashboard.css";

export default function Dashboard() {

    const [analytics, setAnalytics] = useState(null);
    const [forms, setForms] = useState([]);
    useEffect(() => {
        loadAnalytics();
        loadForms();
    }, []);

    async function loadAnalytics() {
        try {
            const res = await getAnalyticsApi(151);
            setAnalytics(res.data);
        } catch (err) {
            console.error(err);
        }
    }
    async function loadForms() {
        try {
            const res = await getMyFormsApi();
            setForms(res.data);
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

    const COLORS = ["var(--accent)", "var(--surface)"];

    return (
        <DashboardLayout>

            <TopBar />

            <div className="welcome-card">

                <h1>👋 Welcome Back</h1>

                <p>
                    Here's an overview of your form analytics.
                </p>

            </div>

            <div className="cards">

                <SummaryCard
                    title="Total Responses"
                    value={analytics?.total_submissions ?? "--"}
                />

                <SummaryCard
                    title="Total Fields"
                    value={analytics?.total_fields ?? "--"}
                />

                <SummaryCard
                    title="Completion Rate"
                    value={`${analytics?.completion_rate ?? "--"}%`}
                />

                <SummaryCard
                    title="Average Time"
                    value={`${analytics?.average_completion_time ?? "--"} sec`}
                />

            </div>

            <div className="charts">

                <div className="chart-card">

                    <h3>Responses Overview</h3>

                    <ResponsiveContainer
                        width="100%"
                        height={360}
                    >
                        <BarChart data={barData}>

                            <XAxis dataKey="name" />

                            <YAxis />

                            <Tooltip />

                            <Bar
                                dataKey="value"
                                fill="var(--accent)"
                                radius={[8, 8, 0, 0]}
                            />

                        </BarChart>

                    </ResponsiveContainer>

                </div>

                <div className="chart-card">

                    <h3>Completion Rate</h3>

                    <ResponsiveContainer
                        width="100%"
                        height={360}
                    >

                        <PieChart>

                            <Pie
                                data={pieData}
                                dataKey="value"
                                outerRadius={110}
                                innerRadius={60}
                            >

                                {pieData.map((entry, index) => (
                                    <Cell
                                        key={index}
                                        fill={COLORS[index]}
                                    />
                                ))}

                            </Pie>

                            <Tooltip />

                        </PieChart>

                    </ResponsiveContainer>

                </div>

            </div>

            <div className="recent-forms">

                <h2>Recent Forms</h2>

                <table className="dashboard-table">

                    <thead>
                        <tr>
                            <th>Form</th>
                            <th>Status</th>
                            <th>Export</th>
                        </tr>
                    </thead>

                    <tbody>

                        {forms.slice(0, 5).map((form) => (

                            <tr key={form.id}>

                                <td>{form.title}</td>

                                <td>{form.status}</td>

                                <td>
                                    <ExportDropdown formId={form.id} />
                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </DashboardLayout>
    );
}