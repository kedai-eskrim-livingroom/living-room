import axiosInstance from "../../axios";

// Ambil semua SIJ
export async function createOrder(formData) {
    const res = await axiosInstance.post("/orders", formData, {
        headers: { "Content-Type": "application/json" },
    });
    return res.data;
}
