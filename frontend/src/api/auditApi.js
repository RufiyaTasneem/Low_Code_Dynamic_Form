import API from "../services/api";

export const getAuditLogsApi = () =>
    API.get("/audit-logs/");