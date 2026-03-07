import axiosInstance from "../../axios";

export async function getDashboard(startDate, endDate) {
    let url = `/dashboard`;

    if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
    } else if (startDate) {
        url += `?startDate=${startDate}`;
    }

    const res = await axiosInstance.get(url);
    return res.data;
}