import Sidebar from "./Sidebar";

export default function DashboardLayout({ children }) {
    return (
        <div className="dashboard">
            <Sidebar />

            <main className="dashboard-content">
                {children}
            </main>
        </div>
    );
}