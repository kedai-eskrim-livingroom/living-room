import axiosInstance from "../../axios";

// Ambil semua SIJ
export async function validateVoucher(code) {
    const res = await axiosInstance.post("/vouchers/validate", code, {
        headers: { "Content-Type": "application/json" },
    });
    return res.data;
}
