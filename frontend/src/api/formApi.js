import API from "../services/api";

// =========================
// Form APIs
// =========================

export const getFormVersions = (formId) =>
    API.get(`/forms/${formId}/versions`);

export const publishFormApi = (formId) =>
    API.post(`/forms/${formId}/publish`);

export const archiveFormApi = (formId) =>
    API.post(`/forms/${formId}/archive`);

export const createNewDraftApi = (formId) =>
    API.post(`/forms/${formId}/draft`);

export const getDraftApi = (formId) =>
    API.get(`/forms/${formId}/draft`);

export const generateShareableLinkApi = (formId) =>
    API.post(`/forms/${formId}/generate-link`);
export const duplicateFormApi = (formId) =>
    API.post(`/forms/${formId}/duplicate`);
export const getPublicFormApi = (token) =>
    API.get(`/public/forms/${token}`);

// =========================
// Conditional Rule APIs
// =========================

export const createConditionalRuleApi = (formId, ruleData) =>
    API.post(`/forms/${formId}/rules`, ruleData);

export const getConditionalRulesApi = (formId) =>
    API.get(`/forms/${formId}/rules`);

export const deleteConditionalRuleApi = (formId, ruleId) =>
    API.delete(`/forms/${formId}/rules/${ruleId}`);

export const evaluateRulesApi = (formId, submittedValues) =>
    API.post(`/forms/${formId}/evaluate`, {
        submitted_values: submittedValues,
    });
export const submitFormApi = (
    formId,
    submittedValues,
    idempotencyKey
) =>
    API.post(
        `/forms/${formId}/submit`,
        {
            submitted_values: submittedValues,
        },
        {
            headers: {
                "Idempotency-Key": idempotencyKey,
            },
        }
    );
export const getMyFormsApi = () =>
    API.get("/forms/my");
export const getDashboardStatsApi = () =>
    API.get("/dashboard/summary");
export const getDashboardSummaryApi = () =>
    API.get("/dashboard/summary");
export const getDashboardAnalyticsApi = () =>
    API.get("/dashboard/analytics");
export default API;
export const getRetentionPolicyApi = (formId) =>
    API.get(`/forms/${formId}/retention`);

export const updateRetentionPolicyApi = (formId, retentionDays) =>
    API.patch(`/forms/${formId}/retention`, {
        retention_days: retentionDays,
    });
export const bulkDeleteResponsesApi = (
    formId,
    submittedBefore
) =>
    API.delete(`/forms/${formId}/responses/bulk`, {
        data: {
            submitted_before: submittedBefore,
        },
    });