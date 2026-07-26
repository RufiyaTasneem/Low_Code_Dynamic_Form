import API from "../services/api";

export const uploadFileApi = (file, onUploadProgress) => {
    const formData = new FormData();

    formData.append("file", file);

    return API.post("/upload/", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
        onUploadProgress,
    });
};