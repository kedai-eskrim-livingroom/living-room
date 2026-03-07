import axiosInstance from "../../axios";

export async function getMenuAdmin() {
    const res = await axiosInstance.get(`/menus`);
    return res.data;
}

export async function createMenu(formData) {
    const res = await axiosInstance.post("/menus", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
}

export async function updateMenu(id, formData) {
    const res = await axiosInstance.put(`/menus/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
}

export async function deleteMenu(id) {
    const res = await axiosInstance.delete("/menus", {
        data: { "id": id },
        headers: { "Content-Type": "application/json" },
    });
    return res.data;
}
