import API from "../services/api";

export const getResponsesApi = (
    formId = null,
    limit = 50,
    offset = 0,
    search = "",
    startDate = "",
    endDate = ""
) => {
    const endpoint = formId ? `/forms/${formId}/responses` : `/forms/all-responses`;
    return API.get(endpoint, {
        params: {
            limit,
            offset,
            search,
            start_date: startDate,
            end_date: endDate,
        },
    });
};

export const bulkDeleteResponsesApi = (formId = null, responseIds = []) => {
    const endpoint = formId ? `/forms/${formId}/responses/bulk` : `/forms/responses/bulk`;
    return API.delete(endpoint, {
        data: {
            response_ids: responseIds,
        },
    });
};