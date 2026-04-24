"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { format } from "date-fns";
import { id } from "date-fns/locale"; // Untuk format tanggal bahasa Indonesia
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    IconReceipt,
    IconCalendarWeek,
    IconCash,
    IconLoader2,
    IconFileExport,
    IconWallet
} from '@tabler/icons-react';

import DateRangeModal from "@/components/DateRangeModal";
import { exportExcel, getHistory } from "@/services/api/history";
import Image from "next/image";
import StatCard from "@/components/StatCard";
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
        headerDateLabel = "Hari ini, " + format(new Date(dateFilter.start), "dd MMMM yyyy", { locale: id });
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
            <h1 className="text-2xl font-bold text-neutral-900 mt-2">Riwayat Penjualan</h1>

            {/* Area Summary Cards */}
            <div className="flex flex-col gap-4">
                <StatCard
                    icon={<IconReceipt size={28} stroke={2} />}
                    label="Total Items Terjual"
                    value={isLoading ? "..." : summary.totalItemsSold}
                    from="from-orange-300/50" to="to-orange-100"
                    borderColor="border-orange-500" labelColor="text-orange-500" textColor="text-orange-600" delay={0}
                    iconBorderColor="border-orange-300"
                />
                <StatCard
                    icon={<IconWallet size={28} stroke={2} />}
                    label="Total Pendapatan"
                    value={isLoading ? "..." : `Rp ${summary.totalRevenue.toLocaleString("id-ID")}`}
                    from="from-emerald-300/50" to="to-emerald-100"
                    borderColor="border-emerald-500" labelColor="text-emerald-500" textColor="text-emerald-600" delay={60}
                    iconBorderColor="border-emerald-300"
                />
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
                        <Button className="w-full bg-orange-500 hover:bg-orange-700 text-white rounded-lg py-2 px-4 gap-1 font-semibold text-sm min-h-10.5">
                            <IconFileExport className="w-5 h-5" /> Export
                        </Button>
                    }
                />

                {/* Modal Filter Tanggal (Mengubah state SWR) */}
                <DateRangeModal
                    title="Tanggal Riwayat"
                    actionLabel="Set Tanggal"
                    onAction={(start, end) => setDateFilter({ start, end })}
                    triggerNode={
                        <button
                            className="flex items-center gap-2 w-full px-4 py-2 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-400 transition-colors text-left font-medium hover:border-orange-500 focus:outline-none"
                        >
                            <span className="text-neutral-400"><IconCalendarWeek size={20} stroke={2} /></span>
                            {dateLabel || "Pilih tanggal"}
                        </button>
                    }
                />
            </div>

            {/* Daftar Riwayat Transaksi */}
            <div className="flex flex-col gap-3 mt-2">
                <div className="flex items-baseline gap-2 mb-1">
                    <h2 className="text-base font-semibold text-neutral-900 capitalize">{headerDateLabel}</h2>
                </div>

                {isLoading ? (
                    <div className="flex justify-center p-10"><IconLoader2 className="w-8 h-8 text-[#FF7A00] animate-spin" /></div>
                ) : orders.length === 0 ? (
                    <div className="text-center p-8 text-neutral-500 bg-white rounded-xl border border-dashed border-neutral-300">
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
                            <div key={order.id} className="flex items-center justify-between p-2 bg-orange-100 border-none rounded-xl hover:shadow-md transition-shadow min-h-14">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center justify-center w-12 h-12 bg-white border border-orange-300 rounded-lg shrink-0">
                                        {order.paymentMethod === "QRIS" ? <Image width={28} height={13} src={"/qris.svg"} alt="qris" className="w-7 h-3.25 text-neutral-700" /> : <IconCash className="w-6 h-5.5 text-neutral-700" />}
                                    </div>
                                    <div className="flex flex-col max-w-[150px] sm:max-w-xs">
                                        <span className="font-semibold text-black text-sm truncate">{itemsString}</span>
                                        <span className="text-sm text-black">{timeString}</span>
                                    </div>
                                </div>
                                <span className="font-bold text-orange-500 text-sm shrink-0">
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