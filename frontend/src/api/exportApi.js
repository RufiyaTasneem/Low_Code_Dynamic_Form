import API from "../services/api";

export const exportCSVApi = async (formId) =>
    API.get(`/forms/${formId}/export?format=csv`, {
        responseType: "blob",
    });

export const exportJSONApi = async (formId) =>
    API.get(`/forms/${formId}/export?format=json`, {
        responseType: "blob",
    });