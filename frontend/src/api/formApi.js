import axios from "axios";

const API = axios.create({
    baseURL: "http://127.0.0.1:8000",
});

export const getFormVersions = (formId) => API.get(`/forms/${formId}/versions`);
export const publishFormApi = (formId) => API.post(`/forms/${formId}/publish`);
export const archiveFormApi = (formId) => API.post(`/forms/${formId}/archive`);
export const createNewDraftApi = (formId) =>
    API.post(`/forms/${formId}/draft`);

export const getDraftApi = (formId) =>
    API.get(`/forms/${formId}/draft`);
export default API;