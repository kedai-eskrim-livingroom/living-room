"use client";

import { useCallback, useEffect, useState } from "react";
import { X, Search, Plus, Eye, EyeOff } from "lucide-react";

import {
    getAccountAdmin,
    createAccount,
    updateAccount,
    deleteAccount,
} from "@/services/api/admin/account";

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import AccountCard from "@/components/AccountCard";

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonAccountCard() {
    return (
        <div className="flex items-stretch rounded-xl overflow-hidden border border-neutral-100 animate-pulse min-h-[72px]">
            <div className="w-16 bg-orange-100 flex items-center justify-center shrink-0">
                <div className="w-7 h-7 rounded-md bg-orange-200" />
            </div>
            <div className="flex-1 bg-white px-4 py-3 flex flex-col justify-center gap-2">
                <div className="h-3 bg-neutral-200 rounded w-3/4" />
            </div>
            <div className="w-10 bg-white flex items-center justify-center shrink-0 pr-3">
                <div className="h-5 w-1 bg-neutral-200 rounded-full" />
            </div>
        </div>
    );
}

// ─── Form Modal (Tambah & Edit) ────────────────────────────────────────────────
function AccountFormModal({ isOpen, onClose, onSubmit, editData }) {
    const isEdit = !!editData;

    const [form, setForm] = useState({ email: "", password: "", role: "", confirmPassword: "" });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        if (isEdit && editData) {
            setForm({ email: editData.email ?? "", password: "", role: editData.role ?? "", confirmPassword: "" });
        } else {
            setForm({ email: "", role: "", password: "", confirmPassword: "" });
        }
        setErrors({});
        setShowPassword(false);
        setShowConfirm(false);
    }, [isOpen, isEdit, editData]);

    const validate = () => {
        const errs = {};
        if (!form.email.trim()) errs.email = "Email wajib diisi.";
        else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Format email tidak valid.";
        if (!form.role) errs.role = "Role wajib dipilih.";
        if (!isEdit) {
            if (!form.password) errs.password = "Password wajib diisi.";
            else if (form.password.length < 6) errs.password = "Password minimal 6 karakter.";
        } else {
            if (form.password && form.password.length < 6)
                errs.password = "Password minimal 6 karakter.";
        }

        if (form.password !== form.confirmPassword)
            errs.confirmPassword = "Konfirmasi password tidak cocok.";

        return errs;
    };

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    const handleSubmit = async () => {
        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }
        setIsSubmitting(true);
        try {
            const payload = { email: form.email.trim(), role: form.role };
            if (form.password) payload.password = form.password;
            await onSubmit(payload);
            onClose();
        } catch (err) {
            setErrors({ submit: err?.response?.data?.message ?? "Terjadi kesalahan. Coba lagi." });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                showCloseButton={false}
                className="w-[calc(100%-2rem)] sm:max-w-md bg-[#FFF8F0] rounded-2xl border border-orange-500 p-0 gap-0"
            >
                <DialogHeader className="flex flex-row items-center justify-between px-6 pt-6 pb-2">
                    <DialogTitle className="text-xl font-bold text-black">
                        {isEdit ? "Edit Akun" : "Tambah Akun"}
                    </DialogTitle>
                    <DialogClose asChild>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-md hover:bg-orange-100 transition-colors"
                        >
                            <X className="w-5 h-5 text-neutral-700" />
                        </button>
                    </DialogClose>
                </DialogHeader>

                <div className="px-6 pb-2 pt-4 flex flex-col gap-4">
                    {errors.submit && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                            {errors.submit}
                        </div>
                    )}

                    {/* Email */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-neutral-800">Email</label>
                        <input
                            type="email"
                            placeholder="email@mail.com"
                            value={form.email}
                            onChange={(e) => handleChange("email", e.target.value)}
                            className={`w-full bg-white rounded-xl px-4 py-3 text-sm outline-none border transition-colors placeholder:text-neutral-400 ${errors.email
                                ? "border-red-400 focus:border-red-500"
                                : "border-neutral-200 focus:border-[#FF7A00]"
                                }`}
                        />
                        {errors.email && <p className="text-xs text-red-500 mt-0.5">{errors.email}</p>}
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-neutral-800">Role</label>
                        <Select value={form.role} onValueChange={(val) => handleChange("role", val)}>
                            <SelectTrigger
                                className={`w-full bg-white rounded-xl px-4 py-5 h-auto text-sm outline-none border transition-colors ${errors.role
                                    ? "border-red-400 focus:ring-red-500 focus:border-red-500"
                                    : "border-neutral-200 focus:ring-[#FF7A00] focus:border-[#FF7A00]"
                                    }`}
                            >
                                <SelectValue placeholder="Pilih Role (Admin / Penjaga)" />
                            </SelectTrigger>
                            <SelectContent className="bg-white rounded-xl border-neutral-200">
                                <SelectItem value="ADMIN" className="cursor-pointer">ADMIN</SelectItem>
                                <SelectItem value="PENJAGA" className="cursor-pointer">PENJAGA</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.role && <p className="text-xs text-red-500 mt-0.5">{errors.role}</p>}
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-neutral-800">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder={isEdit ? "••••••••" : "Masukan password"}
                                value={form.password}
                                onChange={(e) => handleChange("password", e.target.value)}
                                className={`w-full bg-white rounded-xl px-4 py-3 pr-10 text-sm outline-none border transition-colors placeholder:text-neutral-400 ${errors.password
                                    ? "border-red-400 focus:border-red-500"
                                    : "border-neutral-200 focus:border-[#FF7A00]"
                                    }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {errors.password && <p className="text-xs text-red-500 mt-0.5">{errors.password}</p>}
                    </div>

                    {/* Konfirmasi Password */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-neutral-800">Konfirmasi Password</label>
                        <div className="relative">
                            <input
                                type={showConfirm ? "text" : "password"}
                                placeholder={isEdit ? "••••••••" : "Masukan ulang password"}
                                value={form.confirmPassword}
                                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                                className={`w-full bg-white rounded-xl px-4 py-3 pr-10 text-sm outline-none border transition-colors placeholder:text-neutral-400 ${errors.confirmPassword
                                    ? "border-red-400 focus:border-red-500"
                                    : "border-neutral-200 focus:border-[#FF7A00]"
                                    }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                            >
                                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-xs text-red-500 mt-0.5">{errors.confirmPassword}</p>
                        )}
                    </div>
                </div>

                <div className="px-6 pb-6 pt-4 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl border-2 border-[#FF7A00] text-[#FF7A00] font-bold text-sm hover:bg-orange-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex-1 py-3 rounded-xl bg-[#FF7A00] hover:bg-[#E56E00] disabled:opacity-60 text-white font-bold text-sm transition-colors"
                    >
                        {isSubmitting ? "Menyimpan..." : isEdit ? "Simpan" : "Tambah"}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ─── Delete Modal ──────────────────────────────────────────────────────────────
function DeleteModal({ isOpen, onClose, onConfirm, account }) {
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
            setDeleteError(err?.response?.data?.message ?? "Gagal menghapus akun. Coba lagi.");
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
                    <DialogTitle>Konfirmasi Hapus Akun</DialogTitle>
                </VisuallyHidden>
                <div className="flex flex-col items-center text-center gap-3">
                    <h2 className="text-lg font-bold text-neutral-900">Hapus Akun?</h2>
                    <p className="text-sm text-black">
                        Anda yakin ingin menghapus{" "}
                        <span className="font-semibold">{account?.email}</span> dari daftar akun?
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
                        className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold text-sm transition-colors"
                    >
                        {isDeleting ? "Menghapus..." : "Hapus"}
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full py-3 rounded-xl border-2 border-[#FF7A00] text-[#FF7A00] font-bold text-sm hover:bg-orange-50 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function AccountAdminPage() {
    const [accounts, setAccounts] = useState([]);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [formModal, setFormModal] = useState({ open: false, editData: null });
    const [deleteModal, setDeleteModal] = useState({ open: false, account: null });

    const fetchAccounts = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const raw = await getAccountAdmin();
            const list = Array.isArray(raw) ? raw : raw?.data ?? [];
            setAccounts(list);
        } catch (err) {
            setError("Gagal memuat data akun. Coba muat ulang.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAccounts();
    }, [fetchAccounts]);

    const filtered = accounts.filter((a) =>
        a.email?.toLowerCase().includes(search.toLowerCase())
    );

    const handleCreate = async (payload) => {
        await createAccount(payload);
        await fetchAccounts();
    };

    const handleUpdate = async (payload) => {
        await updateAccount(formModal.editData.id, payload);
        await fetchAccounts();
    };

    const handleDelete = async () => {
        await deleteAccount(deleteModal.account.id);
        await fetchAccounts();
        setDeleteModal({ open: false, account: null });
    };

    return (
        <div className="flex flex-col gap-6 max-w-2xl mx-auto pb-10">
            <h1 className="text-2xl font-bold text-neutral-900 mt-2">Akun</h1>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                    type="text"
                    placeholder="Cari Akun"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-[#FF7A00] transition-colors placeholder:text-neutral-400"
                />
            </div>

            {/* Tombol Tambah Akun */}
            <button
                onClick={() => setFormModal({ open: true, editData: null })}
                className="w-full bg-[#FF7A00] hover:bg-[#E56E00] text-white font-bold text-sm py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
                <Plus className="w-4 h-4" strokeWidth={2.5} />
                Tambah Akun
            </button>

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={fetchAccounts} className="ml-3 underline font-semibold">
                        Coba lagi
                    </button>
                </div>
            )}

            {/* Daftar Akun */}
            <div className="flex flex-col gap-3">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => <SkeletonAccountCard key={i} />)
                ) : filtered.length === 0 ? (
                    <div className="text-center p-8 text-neutral-500 bg-white rounded-xl border border-dashed border-neutral-300">
                        {search ? "Akun tidak ditemukan." : "Belum ada akun yang terdaftar."}
                    </div>
                ) : (
                    filtered.map((account, index) => (
                        <AccountCard
                            key={account.id}
                            index={index + 1}
                            email={account.email}
                            role={account.role}
                            onEdit={() => setFormModal({ open: true, editData: account })}
                            onDelete={() => setDeleteModal({ open: true, account })}
                        />
                    ))
                )}
            </div>

            {/* Form Modal (Tambah & Edit) */}
            <AccountFormModal
                isOpen={formModal.open}
                onClose={() => setFormModal({ open: false, editData: null })}
                onSubmit={formModal.editData ? handleUpdate : handleCreate}
                editData={formModal.editData}
            />

            {/* Delete Modal */}
            <DeleteModal
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, account: null })}
                onConfirm={handleDelete}
                account={deleteModal.account}
            />
        </div>
    );
}