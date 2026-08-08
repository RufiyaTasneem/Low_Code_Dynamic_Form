import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { User, Lock, Bell, Activity, ArrowRight, Check } from "lucide-react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import TopBar from "../components/dashboard/TopBar";
import "./Settings.css";

export default function Settings() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("account");

    const [email, setEmail] = useState("admin@example.com");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [savedMsg, setSavedMsg] = useState("");

    const handleSavePassword = (e) => {
        e.preventDefault();
        if (newPassword && newPassword !== confirmPassword) {
            alert(t("New passwords do not match."));
            return;
        }
        setSavedMsg(t("Settings updated successfully!"));
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setSavedMsg(""), 3500);
    };

    const navItems = [
        { id: "account", label: t("Account"), icon: User },
        { id: "password", label: t("Password & Security"), icon: Lock },
        { id: "notifications", label: t("Notifications"), icon: Bell },
        { id: "audit", label: t("Audit Activity"), icon: Activity },
    ];

    return (
        <DashboardLayout>
            <TopBar
                title={t("Settings")}
                subtitle={t("Manage account and system settings")}
            />

            <div className="settings-page-wrapper">
                {savedMsg && (
                    <div className="settings-toast success">
                        <Check size={18} />
                        <span>{savedMsg}</span>
                    </div>
                )}

                <div className="settings-grid">
                    {/* Left Sidebar Menu */}
                    <aside className="settings-menu-card">
                        <div className="settings-menu-header">
                            <h3>{t("Settings")}</h3>
                        </div>
                        <nav className="settings-nav-list">
                            {navItems.map((item) => {
                                const IconComponent = item.icon;
                                const isActive = activeTab === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        className={`settings-nav-btn ${isActive ? "active" : ""}`}
                                        onClick={() => setActiveTab(item.id)}
                                    >
                                        <IconComponent size={18} className="nav-icon" />
                                        <span>{item.label}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </aside>

                    {/* Right Content Column */}
                    <main className="settings-content-area">
                        {/* Account Section */}
                        {(activeTab === "account" || activeTab === "all") && (
                            <section className="settings-card" id="section-account">
                                <div className="card-header">
                                    <div className="card-icon-wrap purple">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <h2>{t("Account")}</h2>
                                        <p>{t("Manage your account information.")}</p>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <div className="form-group">
                                        <label htmlFor="settings-email">{t("Email")}</label>
                                        <input
                                            id="settings-email"
                                            type="email"
                                            className="settings-input"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="admin@example.com"
                                        />
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Password & Security Section */}
                        {(activeTab === "password" || activeTab === "all") && (
                            <section className="settings-card" id="section-password">
                                <div className="card-header">
                                    <div className="card-icon-wrap blue">
                                        <Lock size={20} />
                                    </div>
                                    <div>
                                        <h2>{t("Password & Security")}</h2>
                                        <p>{t("Update your password to keep your account secure.")}</p>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <form onSubmit={handleSavePassword}>
                                        <div className="form-group">
                                            <label htmlFor="current-pass">{t("Current Password")}</label>
                                            <input
                                                id="current-pass"
                                                type="password"
                                                className="settings-input"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                placeholder={t("Enter current password")}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="new-pass">{t("New Password")}</label>
                                            <input
                                                id="new-pass"
                                                type="password"
                                                className="settings-input"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder={t("Enter new password")}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="confirm-pass">{t("Confirm Password")}</label>
                                            <input
                                                id="confirm-pass"
                                                type="password"
                                                className="settings-input"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder={t("Confirm new password")}
                                            />
                                        </div>
                                        <div className="form-actions-row">
                                            <button type="submit" className="settings-primary-btn">
                                                {t("Save Changes")}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </section>
                        )}

                        {/* Notifications Section */}
                        {(activeTab === "notifications" || activeTab === "all") && (
                            <section className="settings-card" id="section-notifications">
                                <div className="card-header">
                                    <div className="card-icon-wrap amber">
                                        <Bell size={20} />
                                    </div>
                                    <div>
                                        <h2>{t("Notifications")}</h2>
                                        <p>{t("Configure system and response notification preferences.")}</p>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <div className="toggle-row">
                                        <div className="toggle-info">
                                            <strong>{t("Email Notifications")}</strong>
                                            <p>{t("Receive email alerts for form responses")}</p>
                                        </div>
                                        <button
                                            type="button"
                                            className={`toggle-switch ${emailNotifications ? "on" : "off"}`}
                                            onClick={() => setEmailNotifications(!emailNotifications)}
                                            aria-label="Toggle email notifications"
                                        >
                                            <span className="toggle-thumb" />
                                            <span className="toggle-label">{emailNotifications ? "ON" : "OFF"}</span>
                                        </button>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Audit Activity Section */}
                        {(activeTab === "audit" || activeTab === "all") && (
                            <section className="settings-card" id="section-audit">
                                <div className="card-header">
                                    <div className="card-icon-wrap emerald">
                                        <Activity size={20} />
                                    </div>
                                    <div>
                                        <h2>{t("Audit Activity")}</h2>
                                        <p>{t("Review account, form, and security audit logs.")}</p>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <div className="audit-action-box">
                                        <div>
                                            <strong>{t("Audit Logs")}</strong>
                                            <p>{t("Review account and security activity across all forms.")}</p>
                                        </div>
                                        <button
                                            type="button"
                                            className="settings-secondary-btn"
                                            onClick={() => navigate("/audit-logs")}
                                        >
                                            <span>{t("View Audit Logs")}</span>
                                            <ArrowRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </section>
                        )}
                    </main>
                </div>
            </div>
        </DashboardLayout>
    );
}
