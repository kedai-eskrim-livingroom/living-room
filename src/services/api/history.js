import axiosInstance from "../axios";

export async function getHistory(startDate, endDate) {
    let url = `/orders/history`;

    if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
    } else if (startDate) {
        url += `?startDate=${startDate}`;
    }

    const res = await axiosInstance.get(url);
    return res.data;
}

export async function getDailyHistory() {
    const res = await axiosInstance.get(`/orders/daily`);
    return res.data;
}

export async function exportExcel(startDate, endDate) {
    try {
        let url = `/orders/export`;
        let fileName = "Laporan_Penjualan_LivingRoom";

        // 1. Logika URL yang rapi (Sama seperti getHistory)
        if (startDate && endDate) {
            url += `?startDate=${startDate}&endDate=${endDate}`;
            fileName += `_${startDate}_sampai_${endDate}`;
        } else if (startDate) {
            url += `?startDate=${startDate}`;
            fileName += `_${startDate}`;
        } else {
            fileName += `_Semua_Waktu`;
        }

        // 2. Hit API untuk ambil file
        const res = await axiosInstance.get(url, {
            responseType: "blob",
        });

        // 3. Proses Download di Browser
        const blob = new Blob([res.data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const objectUrl = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = `${fileName}.xlsx`;
        document.body.appendChild(link);
        link.click();

        // 4. Bersihkan memori browser
        window.URL.revokeObjectURL(objectUrl);
        document.body.removeChild(link);

        return { success: true };
    } catch (err) {
        console.error("Gagal export Excel:", err);
        throw err;
    }
}