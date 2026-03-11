"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { format } from "date-fns";
import { id } from "date-fns/locale"; // Untuk format tanggal bahasa Indonesia
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Utensils, Coins, Download, Calendar as CalendarIcon,
    Search, QrCode, Banknote, Loader2,
    FileInput
} from "lucide-react";
import { IconBusinessplan, IconToolsKitchen2 } from '@tabler/icons-react';

import DateRangeModal from "@/components/DateRangeModal";
import { exportExcel, getHistory } from "@/utils/api/history";
import Image from "next/image";
const fetcher = async ([key, start, end]) => {
    const res = await getHistory(start, end);
    return res.data; // res.data ini berisi { summary, orders } dari backend
};

export default function RiwayatAdminPage() {
    // Secara default tarik data "Hari Ini"
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const [dateFilter, setDateFilter] = useState({ start: todayStr, end: todayStr });

    // Implementasi SWR
    const { data, error, isLoading } = useSWR(
        ['history', dateFilter.start, dateFilter.end],
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 60000,
        }
    );

    // Ekstrak Data
    const orders = data?.orders || [];
    const summary = data?.summary || { totalItemsSold: 0, totalRevenue: 0 };

    // Logika pembuatan label tanggal
    let dateLabel = "Semua Waktu";
    let headerDateLabel = "Semua Data";

    if (dateFilter.start && dateFilter.end && dateFilter.start !== dateFilter.end) {
        dateLabel = `${format(new Date(dateFilter.start), "MMM dd, yyyy")} - ${format(new Date(dateFilter.end), "MMM dd, yyyy")}`;
        headerDateLabel = `${format(new Date(dateFilter.start), "dd MMM yyyy")} - ${format(new Date(dateFilter.end), "dd MMM yyyy")}`;
    } else if (dateFilter.start) {
        dateLabel = format(new Date(dateFilter.start), "MMM dd, yyyy");
        headerDateLabel = format(new Date(dateFilter.start), "EEEE, dd MMMM yyyy", { locale: id });
    }

    // Tampilan jika terjadi Error pada Fetching SWR
    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-red-500 font-bold">Gagal memuat data riwayat penjualan.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 max-w-2xl mx-auto pb-10">
            <h1 className="text-2xl font-bold text-gray-900 mt-2">Riwayat Penjualan</h1>

            {/* Area Summary Cards */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 p-4 shadow-none rounded-[16px] bg-linear-to-r from-orange-300/50 to-orange-100 border-orange-500 border">
                    <div className="flex items-center justify-center w-14 h-14 bg-white rounded-lg border border-orange-300 shrink-0">
                        <IconToolsKitchen2 className="w-7 h-7 text-orange-500" stroke={2} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-medium text-orange-500">Total Items Terjual</span>
                        <span className="text-2xl font-bold text-orange-600">
                            {isLoading ? "..." : summary.totalItemsSold}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2 p-4 shadow-none rounded-[16px] bg-linear-to-r from-emerald-300/50 to-emerald-100 border-emerald-500 border">
                    <div className="flex items-center justify-center w-14 h-14 bg-white rounded-lg border border-emerald-300 shrink-0">
                        <IconBusinessplan className="w-7 h-7 text-emerald-500" stroke={2} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-medium text-emerald-500">Hari Ini </span>
                        <span className="text-2xl font-bold text-emerald-600">
                            {isLoading ? "..." : `Rp ${summary.totalRevenue.toLocaleString("id-ID")}`}
                        </span>
                    </div>
                </div>


            </div>

            {/* Area Action & Filter */}
            <div className="flex flex-col gap-3">
                {/* Modal Export (Tidak mengubah state SWR, hanya hit API Export) */}
                <DateRangeModal
                    title="Export Riwayat"
                    actionLabel="Export"
                    isExport={true}
                    onAction={async (start, end) => await exportExcel(start, end)}
                    triggerNode={
                        <Button className="w-full bg-[#FF7A00] hover:bg-[#E56E00] text-white rounded-lg py-6 shadow-sm font-bold">
                            <FileInput className="w-5 h-5 mr-2" /> Export
                        </Button>
                    }
                />

                <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                        value={dateLabel}
                        className="pl-10 py-6 rounded-lg border-gray-200 bg-white"
                        readOnly
                    />
                </div>

                {/* Modal Filter Tanggal (Mengubah state SWR) */}
                <DateRangeModal
                    title="Tanggal Riwayat"
                    actionLabel="Set Tanggal"
                    onAction={(start, end) => setDateFilter({ start, end })}
                    triggerNode={
                        <div className="relative cursor-pointer group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <div className="flex items-center pl-10 py-3 h-[50px] rounded-lg border border-gray-200 bg-white text-gray-500 group-hover:bg-gray-50 transition-colors">
                                Pilih tanggal
                            </div>
                        </div>
                    }
                />
            </div>

            {/* Daftar Riwayat Transaksi */}
            <div className="flex flex-col gap-3 mt-2">
                <div className="flex items-baseline gap-2 mb-1">
                    <h2 className="text-base font-bold text-gray-900 capitalize">{headerDateLabel}</h2>
                </div>

                {isLoading ? (
                    <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 text-[#FF7A00] animate-spin" /></div>
                ) : orders.length === 0 ? (
                    <div className="text-center p-8 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                        Tidak ada transaksi pada tanggal ini.
                    </div>
                ) : (
                    orders.map((order) => {
                        const itemsString = order.orderDetails
                            ?.map(detail => `${detail.qty}x ${detail.menu.name}`)
                            .join(", ") || "Item tidak diketahui";

                        const timeString = new Date(order.createdAt).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit"
                        });

                        return (
                            <div key={order.id} className="flex items-center justify-between p-4 bg-[#FFF8F3] border-none shadow-sm rounded-xl hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center justify-center w-12 h-12 bg-white border border-gray-200 rounded-lg shrink-0">
                                        {order.paymentMethod === "QRIS" ? <Image width={6} height={6} src={"/qris.svg"} alt="qris" className="w-6 h-6 text-gray-700" /> : <Banknote className="w-6 h-6 text-gray-700" />}
                                    </div>
                                    <div className="flex flex-col max-w-[150px] sm:max-w-xs">
                                        <span className="font-bold text-gray-900 truncate">{itemsString}</span>
                                        <span className="text-sm text-gray-500">{timeString}</span>
                                    </div>
                                </div>
                                <span className="font-bold text-[#FF7A00] shrink-0">
                                    Rp {order.totalPrice.toLocaleString("id-ID")}
                                </span>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}