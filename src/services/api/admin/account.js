import axiosInstance from "../../axios";

export async function getAccountAdmin() {
    const res = await axiosInstance.get(`/accounts`);
    return res.data;
}

export async function createAccount(data) {
    const res = await axiosInstance.post("/accounts", data, {
        headers: { "Content-Type": "application/json" },
    });
    return res.data;
}

export async function updateAccount(id, data) {
    const res = await axiosInstance.put(`/accounts/${id}`, data, {
        headers: { "Content-Type": "application/json" },
    });
    return res.data;
}

export async function deleteAccount(id) {
    const res = await axiosInstance.delete("/accounts", {
        data: { id: [id] },
        headers: { "Content-Type": "application/json" },
    });
    return res.data;
}
