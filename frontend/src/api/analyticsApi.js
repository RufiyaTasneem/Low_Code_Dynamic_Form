import API from "../services/api";

export const getAnalyticsApi = (formId) =>
    API.get(`/forms/${formId}/analytics`);

export const getMyFormsApi = () =>
    API.get("/forms/my");