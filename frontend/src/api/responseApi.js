import API from "../services/api";

export const getResponsesApi = (
    formId,
    limit = 20,
    offset = 0,
    search = "",
    startDate = "",
    endDate = ""
) =>
    API.get(`/forms/${formId}/responses`, {
        params: {
            limit,
            offset,
            search,
            start_date: startDate,
            end_date: endDate,
        },
    });
export const bulkDeleteResponsesApi = (formId, responseIds) =>
    API.delete(`/forms/${formId}/responses/bulk`, {
        data: {
            response_ids: responseIds,
        },
    });