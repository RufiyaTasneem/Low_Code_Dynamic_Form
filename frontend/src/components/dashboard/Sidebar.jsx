import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LogOut } from "lucide-react";
import LanguageSwitcher from "../LanguageSwitcher";
import "./Sidebar.css";

export default function Sidebar() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
    };

    return (
        <aside className="sidebar">
            <div className="logo">
                <div className="logo-icon">✨</div>
                <div>
                    <h2>Form Studio</h2>
                    <p>Dynamic Builder</p>
                </div>
            </div>

            <nav>
                <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
                    {t("Dashboard")}
                </NavLink>

                <NavLink to="/forms" className={({ isActive }) => (isActive ? "active" : "")}>
                    {t("Forms")}
                </NavLink>

                <NavLink to="/builder" className={({ isActive }) => (isActive ? "active" : "")}>
                    {t("Builder")}
                </NavLink>

                <NavLink to="/analytics" className={({ isActive }) => (isActive ? "active" : "")}>
                    {t("Analytics")}
                </NavLink>

                <NavLink to="/responses" className={({ isActive }) => (isActive ? "active" : "")}>
                    {t("Responses")}
                </NavLink>

                <NavLink to="/audit-logs" className={({ isActive }) => (isActive ? "active" : "")}>
                    Audit Logs
                </NavLink>
            </nav>

            <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
                <LanguageSwitcher />

                <button className="logout-btn" onClick={logout}>
                    <LogOut size={18} />
                    {t("Logout")}
                </button>
            </div>
        </aside>
    );
}