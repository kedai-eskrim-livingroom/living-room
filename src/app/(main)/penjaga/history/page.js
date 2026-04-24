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

import StatCard from "@/components/StatCard";
import OrderCard from "@/components/OrderCard";
import { getDailyHistory } from "@/services/api/history";
const fetcher = async () => {
    const res = await getDailyHistory();
    return res.data;
};

// ─── Skeleton Helpers ─────────────────────────────────────────────────────────
function SkeletonStatCard() {
    return (
        <div className="flex items-stretch rounded-2xl overflow-hidden border border-orange-100 animate-pulse min-h-[88px]">
            <div className="w-20 bg-orange-100 flex items-center justify-center shrink-0">
                <div className="w-9 h-9 rounded-full bg-orange-200" />
            </div>
            <div className="flex-1 bg-orange-50 px-4 py-4 flex flex-col justify-center gap-2">
                <div className="h-3 bg-orange-200 rounded w-1/2" />
                <div className="h-5 bg-orange-200 rounded w-3/4" />
            </div>
        </div>
    );
}

function SkeletonOrderCard() {
    return (
        <div className="flex items-stretch rounded-2xl overflow-hidden border border-orange-100 animate-pulse min-h-[72px]">
            <div className="w-14 bg-orange-100 flex items-center justify-center shrink-0">
                <div className="w-7 h-7 rounded-full bg-orange-200" />
            </div>
            <div className="flex-1 bg-orange-50 px-4 py-3 flex flex-col justify-center gap-2">
                <div className="h-3 bg-orange-200 rounded w-3/4" />
                <div className="h-3 bg-orange-100 rounded w-1/2" />
            </div>
            <div className="w-20 bg-orange-50 flex items-center justify-center shrink-0 pr-3">
                <div className="h-4 bg-orange-200 rounded w-full" />
            </div>
        </div>
    );
}

export default function RiwayatPenjagaPage() {
    // Secara default tarik data "Hari Ini"
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const [dateFilter, setDateFilter] = useState({ start: todayStr, end: todayStr });

    // Implementasi SWR
    const { data, error, isLoading } = useSWR(
        'daily',
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 60000,
        }
    );

    // Ekstrak Data
    const orders = data?.orders || [];
    const summary = data?.summary || { totalItemsSold: 0, totalRevenue: 0 };

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

            <div className="flex flex-col gap-4">
                {isLoading ? (
                    <>
                        <SkeletonStatCard />
                        <SkeletonStatCard />
                    </>
                ) : (
                    <>
                        <StatCard
                            icon={<IconReceipt size={28} stroke={2} />}
                            label="Total Items Terjual"
                            value={summary.totalItemsSold}
                            from="from-orange-300/50" to="to-orange-100"
                            borderColor="border-orange-500" labelColor="text-orange-500" textColor="text-orange-600" delay={0}
                            iconBorderColor="border-orange-300"
                        />
                        <StatCard
                            icon={<IconWallet size={28} stroke={2} />}
                            label="Total Pendapatan"
                            value={`Rp ${summary.totalRevenue.toLocaleString("id-ID")}`}
                            from="from-emerald-300/50" to="to-emerald-100"
                            borderColor="border-emerald-500" labelColor="text-emerald-500" textColor="text-emerald-600" delay={60}
                            iconBorderColor="border-emerald-300"
                        />
                    </>
                )}
            </div>

            {/* Daftar Riwayat Transaksi */}
            <div className="flex flex-col gap-3 mt-2">
                <div className="flex items-baseline gap-2 mb-1">
                    <h2 className="text-base font-semibold text-neutral-900 capitalize">Hari ini</h2>
                </div>

                {isLoading ? (
                    <div className="flex flex-col gap-3">
                        {Array.from({ length: 4 }).map((_, i) => <SkeletonOrderCard key={i} />)}
                    </div>
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
                            <OrderCard
                                key={order.id}
                                paymentMethod={order.paymentMethod}
                                itemsString={itemsString}
                                timeString={timeString}
                                totalPrice={order.totalPrice}
                            />
                        );
                    })
                )}
            </div>
        </div>
    );
}