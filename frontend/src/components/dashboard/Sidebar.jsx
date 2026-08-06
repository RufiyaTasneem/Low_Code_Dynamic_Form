import { NavLink, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import "./Sidebar.css";

export default function Sidebar() {

    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
    };

    return (

        <aside className="sidebar">

            <div className="logo">

                <div className="logo-icon">
                    ✨
                </div>

                <div>
                    <h2>Form Studio</h2>
                    <p>Dynamic Builder</p>
                </div>

            </div>

            <nav>
                <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
                    Dashboard
                </NavLink>

                <NavLink to="/forms" className={({ isActive }) => (isActive ? "active" : "")}>
                    Forms
                </NavLink>

                <NavLink to="/builder" className={({ isActive }) => (isActive ? "active" : "")}>
                    Builder
                </NavLink>

                <NavLink to="/analytics" className={({ isActive }) => (isActive ? "active" : "")}>
                    Analytics
                </NavLink>

                <NavLink to="/responses" className={({ isActive }) => (isActive ? "active" : "")}>
                    Responses
                </NavLink>

                <NavLink to="/audit-logs" className={({ isActive }) => (isActive ? "active" : "")}>
                    Audit Logs
                </NavLink>
            </nav>

            <button
                className="logout-btn"
                onClick={logout}
            >
                <LogOut size={18} />
                Logout
            </button>

        </aside>

    );

}