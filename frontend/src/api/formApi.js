import API from "../services/api";

export const getFormVersions = (formId) => API.get(`/forms/${formId}/versions`);
export const publishFormApi = (formId) => API.post(`/forms/${formId}/publish`);
export const archiveFormApi = (formId) => API.post(`/forms/${formId}/archive`);
export const createNewDraftApi = (formId) => API.post(`/forms/${formId}/draft`);

export const getDraftApi = (formId) => API.get(`/forms/${formId}/draft`);

export const generateShareableLinkApi = (formId) =>
    API.post(`/forms/${formId}/generate-link`);

export const getPublicFormApi = (token) =>
    API.get(`/public/forms/${token}`);

export default API;