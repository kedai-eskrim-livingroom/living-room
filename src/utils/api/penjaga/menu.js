import axiosInstance from "../../axios";

export async function getMenuPenjaga() {
    const res = await axiosInstance.get(`/menus`);
    return res.data;
}