import axiosInstance from "../../axios";
import dayjs from "dayjs";

export async function getHistory(startDate, endDate) {
    // Opsional: Anda juga bisa menambahkan filter tanggal untuk getHistory biasa
    let url = `/orders/history`;
    if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    const res = await axiosInstance.get(url);
    return res.data;
}

export async function exportExcel(exportDate) {
    try {
        let url = "/orders/export"; // Disesuaikan dengan endpoint backend POS
        let fileName = "Laporan_Penjualan_LivingRoom";

        // Mengecek format dari date picker (biasanya array [startDate, endDate])
        if (Array.isArray(exportDate) && exportDate[0]) {
            const start = dayjs(exportDate[0]).format("YYYY-MM-DD");
            url += `?startDate=${start}`;

            // Jika memilih rentang 2 tanggal
            if (exportDate[1]) {
                const end = dayjs(exportDate[1]).format("YYYY-MM-DD");
                url += `&endDate=${end}`;
                fileName += `_${start}_sampai_${end}`;
            }
            // Jika hanya memilih 1 tanggal spesifik
            else {
                fileName += `_${start}`;
            }
        }
        // Fallback jika dikirim single Date object / string langsung
        else if (exportDate && !Array.isArray(exportDate)) {
            const date = dayjs(exportDate).format("YYYY-MM-DD");
            url += `?startDate=${date}`;
            fileName += `_${date}`;
        }
        else {
            // Jika ingin export semua data tanpa filter tanggal
            fileName += "_Semua_Waktu";
        }

        // Ambil file Excel dari backend (Wajib pakai responseType: "blob")
        const res = await axiosInstance.get(url, {
            responseType: "blob",
        });

        // Unduh otomatis di browser
        const blob = new Blob([res.data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const link = document.createElement("a");
        // Gunakan window.URL agar lebih aman di Next.js (SSR friendly)
        const objectUrl = window.URL.createObjectURL(blob);

        link.href = objectUrl;
        link.download = `${fileName}.xlsx`;
        document.body.appendChild(link); // Append ke body agar jalan mulus di Firefox
        link.click();

        // Bersihkan memory dan elemen
        window.URL.revokeObjectURL(objectUrl);
        document.body.removeChild(link);

        return { success: true };
    } catch (err) {
        console.error("Gagal export Excel:", err);
        throw err;
    }
}