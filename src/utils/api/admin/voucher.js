import axiosInstance from "../../axios";

// Ambil semua SIJ
export async function getVoucher() {
    const res = await axiosInstance.get(`/vouchers`);
    return res.data;
}

export async function createVoucher(formData) {
    const res = await axiosInstance.post("/vouchers", formData, {
        headers: { "Content-Type": "application/json" },
    });
    return res.data;
}

export async function updateVoucher(id, formData) {
    const res = await axiosInstance.put(`/vouchers/${id}`, formData, {
        headers: { "Content-Type": "application/json" },
    });
    return res.data;
}

export async function deleteVoucher(id) {
    const res = await axiosInstance.delete(`/vouchers/${id}`, {
        headers: { "Content-Type": "application/json" },
    });
    return res.data;
}