"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { format, isToday, isYesterday } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import {
    IconArrowLeft,
    IconCash,
    IconLoader2
} from "@tabler/icons-react";

// Import komponen Dialog shadcn & VisuallyHidden
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

import { getHistory, deleteOrders } from "@/services/api/history";

const fetcher = async () => {
    const res = await getHistory("all");
    return res.data;
};

// ─── Komponen Delete Modal (Diadaptasi dari MenuAdminPage) ───────────────
function DeleteModal({ isOpen, onClose, onConfirm, selectedCount }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState(null);

    useEffect(() => {
        if (!isOpen) setDeleteError(null);
    }, [isOpen]);

    const handleDelete = async () => {
        setIsDeleting(true);
        setDeleteError(null);
        try {
            await onConfirm();
            onClose();
        } catch (err) {
            setDeleteError(err?.response?.data?.message ?? "Gagal menghapus pesanan. Coba lagi.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                showCloseButton={false}
                className="w-[calc(100%-2rem)] sm:max-w-sm bg-[#FFF8F0] rounded-2xl border border-orange-500 p-6 gap-0"
            >
                <VisuallyHidden>
                    <DialogTitle>Konfirmasi Hapus Pesanan</DialogTitle>
                </VisuallyHidden>

                <div className="flex flex-col items-center text-center gap-3">
                    <h2 className="text-lg font-bold text-neutral-900">
                        Hapus <span className="text-orange-500">{selectedCount} Item</span>?
                    </h2>
                    <p className="text-sm text-black">
                        Anda yakin ingin menghapus <span className="font-semibold">{selectedCount} pesanan terpilih</span> secara permanen?
                    </p>
                    {deleteError && (
                        <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-xl px-3 py-2 w-full">
                            {deleteError}
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-3 mt-6">
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold text-sm transition-colors cursor-pointer"
                    >
                        {isDeleting ? "Menghapus..." : "Hapus"}
                    </button>
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="w-full py-3 rounded-xl border-2 border-[#FF7A00] text-[#FF7A00] font-bold text-sm hover:bg-orange-50 transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ─── Skeleton yang Meniru OrderCard ──────────────────────────────────────────
function SkeletonManageOrderCard() {
    return (
        <div className="flex items-center justify-between p-2 bg-orange-100/50 rounded-xl min-h-14 animate-pulse">
            <div className="flex items-center gap-4">
                <div className="flex items-center justify-center pl-2 shrink-0">
                    <div className="w-5 h-5 rounded bg-orange-200" />
                </div>
                <div className="w-12 h-12 bg-white border border-orange-200 rounded-lg shrink-0 flex items-center justify-center">
                    <div className="w-6 h-6 rounded bg-orange-100" />
                </div>
                <div className="flex flex-col gap-2">
                    <div className="h-3 bg-orange-200 rounded w-24 sm:w-32" />
                    <div className="h-2 bg-orange-200 rounded w-12" />
                </div>
            </div>
            <div className="pr-2">
                <div className="h-4 bg-orange-200 rounded w-16" />
            </div>
        </div>
    );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function KelolaHistoriPage() {
    const { data, error, isLoading, mutate } = useSWR('manage-history', fetcher, {
        revalidateOnFocus: false,
    });

    const [selectedIds, setSelectedIds] = useState([]);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false); // State Modal

    const orders = data?.orders || [];

    const toggleCheck = (orderId) => {
        setSelectedIds((prev) =>
            prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
        );
    };

    // Fungsi ini sekarang dilempar ke DeleteModal sebagai onConfirm
    const handleConfirmDelete = async () => {
        await deleteOrders(selectedIds);
        await mutate();
        setSelectedIds([]);
    };

    const groupedOrders = orders.reduce((acc, order) => {
        const dateKey = format(new Date(order.createdAt), "yyyy-MM-dd");
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(order);
        return acc;
    }, {});

    const sortedDateKeys = Object.keys(groupedOrders).sort((a, b) => new Date(b) - new Date(a));

    const getDateLabel = (dateStr) => {
        const dateObj = new Date(dateStr);
        if (isToday(dateObj)) return "Hari ini";
        if (isYesterday(dateObj)) return "Kemarin";
        return format(dateObj, "EEEE", { locale: localeId });
    };

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-red-500 font-bold">Gagal memuat data histori.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 max-w-2xl mx-auto pb-32 pt-2 relative min-h-screen">

            {/* Header */}
            <div className="flex items-center gap-3 mt-2">
                <Link href="/admin/riwayat">
                    <Button variant="ghost" size="icon" className="text-neutral-500 hover:text-neutral-900 rounded-full w-10 h-10 hover:bg-orange-50 cursor-pointer">
                        <IconArrowLeft stroke={2} />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold text-neutral-900">Kelola Histori</h1>
            </div>

            <div className="flex flex-col gap-6">
                {isLoading ? (
                    <div className="flex flex-col gap-3 mt-4">
                        <div className="h-5 bg-neutral-200 rounded w-1/3 mb-2 animate-pulse" />
                        {Array.from({ length: 4 }).map((_, i) => <SkeletonManageOrderCard key={i} />)}
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center p-8 text-neutral-500 bg-white rounded-xl border border-dashed border-neutral-300 mt-4">
                        Belum ada riwayat pesanan yang bisa dikelola.
                    </div>
                ) : (
                    sortedDateKeys.map((dateKey) => {
                        const dateObj = new Date(dateKey);
                        return (
                            <div key={dateKey} className="flex flex-col gap-3">

                                {/* Header Tanggal */}
                                <div className="flex items-baseline gap-2 mb-1 mt-2">
                                    <h2 className="text-base font-semibold text-neutral-900 capitalize">
                                        {getDateLabel(dateKey)}
                                    </h2>
                                    <span className="text-sm text-neutral-500 capitalize">
                                        {format(dateObj, "dd MMMM yyyy", { locale: localeId })}
                                    </span>
                                </div>

                                {/* Looping Kartu */}
                                {groupedOrders[dateKey].map((order) => {
                                    const isChecked = selectedIds.includes(order.id);
                                    const itemsString = order.orderDetails?.map(d => `${d.qty}x ${d.menu.name}`).join(", ") || "Item";
                                    const timeString = new Date(order.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

                                    return (
                                        <div
                                            key={order.id}
                                            onClick={() => toggleCheck(order.id)}
                                            className={`flex items-center justify-between p-2 rounded-xl min-h-14 cursor-pointer transition-colors border ${isChecked
                                                ? 'bg-orange-200 border-orange-400'
                                                : 'bg-orange-100 border-transparent hover:border-orange-300'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                {/* Checkbox Baru */}
                                                <div className="flex items-center justify-center pl-2 shrink-0">
                                                    <Checkbox
                                                        checked={isChecked}
                                                        onClick={(e) => e.stopPropagation()}
                                                        onCheckedChange={() => toggleCheck(order.id)}
                                                        className="w-5 h-5 rounded border-orange-400 bg-white data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 shadow-none cursor-pointer"
                                                    />
                                                </div>

                                                {/* Ikon Pembayaran */}
                                                <div className="flex items-center justify-center w-12 h-12 bg-white border border-orange-300 rounded-lg shrink-0">
                                                    {order.paymentMethod === "QRIS" ? (
                                                        <Image
                                                            width={28}
                                                            height={13}
                                                            src={"/qris.svg"}
                                                            alt="qris"
                                                            className="w-7 h-[13px] text-neutral-700"
                                                        />
                                                    ) : (
                                                        <IconCash className="w-6 h-[22px] text-neutral-700" />
                                                    )}
                                                </div>

                                                {/* Info Pesanan */}
                                                <div className="flex flex-col max-w-[130px] sm:max-w-xs">
                                                    <span className="font-semibold text-black text-sm truncate">
                                                        {itemsString}
                                                    </span>
                                                    <span className="text-sm text-black">
                                                        {timeString}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Harga */}
                                            <span className="font-bold text-orange-500 text-sm shrink-0 pr-2">
                                                Rp {order.totalPrice.toLocaleString("id-ID")}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Floating Bottom Bar Action */}
            {selectedIds.length > 0 && (
                <div className="w-auto md:left-72 fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] p-4 md:p-6 z-50 flex items-center justify-between animate-in slide-in-from-bottom-5 duration-300">
                    <div className="max-w-2xl mx-auto flex items-center justify-between w-full px-2">
                        <span className="text-base font-semibold text-neutral-800">
                            {selectedIds.length} Item terpilih
                        </span>
                        <Button
                            onClick={() => setDeleteModalOpen(true)} // Tampilkan Modal
                            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-5 rounded-xl font-bold text-sm shadow-sm transition-colors cursor-pointer"
                        >
                            Hapus
                        </Button>
                    </div>
                </div>
            )}

            {/* Mount komponen DeleteModal di sini */}
            <DeleteModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                selectedCount={selectedIds.length}
            />

        </div>
    );
}