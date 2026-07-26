import API from "./api";

export const register = async (userData) => {
    const response = await API.post("/auth/register", userData);
    return response.data;
};

export const login = async (credentials) => {
    const formData = new URLSearchParams();

    formData.append("username", credentials.email);
    formData.append("password", credentials.password);

    const response = await API.post(
        "/auth/login",
        formData,
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        }
    );

    localStorage.setItem("token", response.data.access_token);
    localStorage.setItem("role", response.data.role);

    return response.data;
};

export const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
};

export const getToken = () => {
    return localStorage.getItem("token");
};

export const getRole = () => {
    return localStorage.getItem("role");
};

export const isAuthenticated = () => {
    return !!localStorage.getItem("token");
};