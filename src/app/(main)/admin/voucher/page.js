"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Search, Plus, Pencil, Trash2, X, CalendarDays } from "lucide-react";
import {
  getVoucher,
  createVoucher,
  updateVoucher,
  deleteVoucher,
} from "@/services/api/admin/voucher";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import DateRangeModal from "@/components/DateRangeModal";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatRupiah(value) {
  const num = String(value).replace(/\D/g, "");
  return num ? parseInt(num, 10).toLocaleString("id-ID") : "";
}

function parseRupiah(value) {
  return parseInt(String(value).replace(/\D/g, "") || "0", 10);
}

function formatDateDisplay(dateStr) {
  if (!dateStr) return "-";
  return format(new Date(dateStr), "dd MMMM yyyy", { locale: localeId });
}

// ─── API Mapping Helpers ─────────────────────────────────────────────────────

/** Normalize API response (snake_case) → UI (camelCase) */
function normalizeVoucher(v) {
  return {
    id: v.id,
    code: v.code ?? "",
    discount: v.discount ?? 0,
    startDate: v.start_date ?? v.startDate ?? "",
    endDate: v.end_date ?? v.endDate ?? "",
  };
}

/** Map form data (camelCase) → API payload (snake_case) */
function toPayload({ code, discount, startDate, endDate }) {
  return {
    code,
    discount,
    startDate,
    endDate,
  };
}

// ─── Voucher Form Modal (Tambah / Edit) ─────────────────────────────────────

function VoucherFormModal({ isOpen, onClose, onSubmit, editData }) {
  const isEdit = !!editData;

  const [form, setForm] = useState({ code: "", discount: "", startDate: "", endDate: "" });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (isEdit && editData) {
        setForm({
          code: editData.code ?? "",
          discount: editData.discount ? String(editData.discount) : "",
          startDate: editData.startDate ?? "",
          endDate: editData.endDate ?? "",
        });
      } else {
        setForm({ code: "", discount: "", startDate: "", endDate: "" });
      }
      setErrors({});
    }
  }, [isOpen, isEdit, editData]);

  const validate = () => {
    const errs = {};
    if (!form.code.trim()) {
      errs.code = "Code voucher wajib diisi.";
    } else if (!/^[A-Z0-9_-]{3,20}$/i.test(form.code.trim())) {
      errs.code = "Code hanya boleh huruf, angka, - atau _ (3–20 karakter).";
    }
    const discountNum = parseRupiah(form.discount);
    if (!form.discount) {
      errs.discount = "Discount wajib diisi.";
    } else if (discountNum <= 0) {
      errs.discount = "Discount harus lebih dari Rp0.";
    }
    if (!form.startDate) {
      errs.startDate = "Tanggal mulai wajib dipilih.";
    }
    if (!form.endDate) {
      errs.endDate = "Tanggal kedaluwarsa wajib dipilih.";
    }
    if (form.startDate && form.endDate && form.startDate > form.endDate) {
      errs.endDate = "Tanggal akhir harus setelah tanggal mulai.";
    }
    return errs;
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleDiscountChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    handleChange("discount", raw);
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit({
        code: form.code.trim().toUpperCase(),
        discount: parseRupiah(form.discount),
        startDate: form.startDate,
        endDate: form.endDate,
      });
      onClose();
    } catch (err) {
      setErrors({
        submit: err?.response?.data?.message ?? "Terjadi kesalahan. Coba lagi.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="w-[calc(100%-2rem)] sm:max-w-sm bg-[#FFF8F0] rounded-3xl border-none p-0 gap-0"
      >
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between px-6 pt-6 pb-2">
          <DialogTitle className="text-xl font-bold text-gray-900">
            {isEdit ? "Edit Voucher" : "Tambah Voucher Baru"}
          </DialogTitle>
          <DialogClose asChild>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-orange-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
          </DialogClose>
        </DialogHeader>

        {/* Body */}
        <div className="px-6 pb-2 pt-4 flex flex-col gap-4">
          {/* Error global */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
              {errors.submit}
            </div>
          )}

          {/* Code */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-800">Code</label>
            <input
              id="voucher-code"
              type="text"
              placeholder="Code"
              value={form.code}
              onChange={(e) => handleChange("code", e.target.value)}
              className={`w-full bg-white rounded-xl px-4 py-3 text-sm outline-none border transition-colors placeholder:text-gray-400 ${errors.code
                ? "border-red-400 focus:border-red-500"
                : "border-gray-200 focus:border-[#FF7A00]"
                }`}
            />
            {errors.code && (
              <p className="text-xs text-red-500 mt-0.5">{errors.code}</p>
            )}
          </div>

          {/* Discount */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-800">Discount</label>
            <input
              id="voucher-discount"
              type="text"
              inputMode="numeric"
              placeholder="Rp0.000"
              value={form.discount ? `Rp${formatRupiah(form.discount)}` : ""}
              onChange={handleDiscountChange}
              className={`w-full bg-white rounded-xl px-4 py-3 text-sm outline-none border transition-colors placeholder:text-gray-400 ${errors.discount
                ? "border-red-400 focus:border-red-500"
                : "border-gray-200 focus:border-[#FF7A00]"
                }`}
            />
            {errors.discount && (
              <p className="text-xs text-red-500 mt-0.5">{errors.discount}</p>
            )}
          </div>

          {/* Masa Berlaku (Start – End) */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-800">
              Masa Berlaku
            </label>
            <DateRangeModal
              title="Masa Berlaku Voucher"
              actionLabel="Set Tanggal"
              onAction={(start, end) => {
                handleChange("startDate", start ?? "");
                handleChange("endDate", end ?? "");
              }}
              triggerNode={
                <button
                  id="voucher-expiry-btn"
                  type="button"
                  className={`w-full bg-white rounded-xl px-4 py-3 text-sm outline-none border transition-colors flex items-center gap-2 text-left ${errors.startDate || errors.endDate
                    ? "border-red-400"
                    : "border-gray-200 hover:border-[#FF7A00]"
                    }`}
                >
                  <CalendarDays
                    className={`w-4 h-4 shrink-0 ${form.startDate || form.endDate ? "text-[#FF7A00]" : "text-gray-400"
                      }`}
                  />
                  <span
                    className={
                      form.startDate || form.endDate ? "text-gray-900" : "text-gray-400"
                    }
                  >
                    {form.startDate && form.endDate
                      ? `${formatDateDisplay(form.startDate)} – ${formatDateDisplay(form.endDate)}`
                      : form.startDate
                        ? `${formatDateDisplay(form.startDate)} – Pilih akhir`
                        : "Pilih Tanggal Mulai & Akhir"}
                  </span>
                </button>
              }
            />
            {errors.startDate && (
              <p className="text-xs text-red-500 mt-0.5">{errors.startDate}</p>
            )}
            {errors.endDate && (
              <p className="text-xs text-red-500 mt-0.5">{errors.endDate}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border-2 border-[#FF7A00] text-[#FF7A00] font-bold text-sm hover:bg-orange-50 transition-colors"
          >
            Cancel
          </button>
          <button
            id="voucher-submit-btn"
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

// ─── Delete Confirm Modal ────────────────────────────────────────────────────

function DeleteModal({ isOpen, onClose, onConfirm, voucher }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Reset error when modal opens/closes
  useEffect(() => {
    if (!isOpen) setDeleteError(null);
  }, [isOpen]);

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await onConfirm();
      onClose(); // only close on success
    } catch (err) {
      setDeleteError(err?.response?.data?.message ?? "Gagal menghapus voucher. Coba lagi.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="w-[calc(100%-2rem)] sm:max-w-xs bg-[#FFF8F0] rounded-3xl border-none p-6 gap-0"
      >
        <VisuallyHidden>
          <DialogTitle>Konfirmasi Hapus Voucher</DialogTitle>
        </VisuallyHidden>
        <div className="flex flex-col items-center text-center gap-3">
          <h2 className="text-lg font-bold text-gray-900">
            Hapus voucher{" "}
            <span className="text-[#FF7A00]">{voucher?.code}</span>?
          </h2>
          <p className="text-sm text-gray-500">
            Anda yakin ingin menghapus voucher{" "}
            <span className="font-semibold">{voucher?.code}</span> dari daftar
            voucher?
          </p>
          {deleteError && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-xl px-3 py-2 w-full">
              {deleteError}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 mt-6">
          <button
            id="delete-confirm-btn"
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

// ─── Voucher Ticket Card ─────────────────────────────────────────────────────

function VoucherCard({ voucher, onEdit, onDelete }) {
  return (
    <div className="flex items-stretch rounded-2xl overflow-hidden">
      {/* Left: code (vertical rotated) */}
      <div className="bg-orange-50 flex items-center justify-center px-3 min-w-13 border-r-2 border-dashed border-orange-300 relative">
        <span
          className="text-[#FF7A00] font-bold text-xs tracking-widest uppercase"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          {voucher.code}
        </span>
        {/* Notch left edge */}
        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#Ffffff] rounded-full" />
      </div>

      {/* Middle: info */}
      <div className="flex-1 bg-[#FFF8F0] px-4 py-4 flex flex-col justify-center">
        <p className="text-[#FF7A00] font-bold text-base leading-tight">
          Discount Rp{formatRupiah(voucher.discount)}
        </p>
        <p className="text-gray-500 text-xs mt-1">
          {voucher.startDate
            ? `Berlaku: ${formatDateDisplay(voucher.startDate)} – ${formatDateDisplay(voucher.endDate)}`
            : `Berlaku sampai ${formatDateDisplay(voucher.endDate)}`}
        </p>
      </div>

      {/* Right: actions */}
      <div className="flex flex-col">
        <button
          onClick={() => onEdit(voucher)}
          className="flex-1 bg-[#DDEEFF] hover:bg-[#C4DDFF] flex items-center justify-center px-4 transition-colors"
          title="Edit voucher"
        >
          <Pencil className="w-4 h-4 text-[#2563EB]" />
        </button>
        <button
          onClick={() => onDelete(voucher)}
          className="flex-1 bg-[#FFE0E8] hover:bg-[#FFC7D4] flex items-center justify-center px-4 transition-colors"
          title="Hapus voucher"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </button>
      </div>
    </div>
  );
}

// ─── Skeleton Loader ─────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="flex items-stretch rounded-2xl overflow-hidden border border-orange-100 animate-pulse">
      <div className="bg-orange-100 w-14 min-h-20 relative">
        {/* Notch left edge placeholder */}
        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#F8F9FA] rounded-full" />
      </div>
      <div className="flex-1 bg-orange-50 px-4 py-4 flex flex-col justify-center gap-2">
        <div className="h-4 bg-orange-200 rounded w-3/4" />
        <div className="h-3 bg-orange-100 rounded w-1/2" />
      </div>
      <div className="flex flex-col w-12">
        <div className="flex-1 bg-blue-100" />
        <div className="flex-1 bg-pink-100" />
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function VoucherPage() {
  const [vouchers, setVouchers] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [formModal, setFormModal] = useState({ open: false, editData: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, voucher: null });

  // ── Fetch ──
  const fetchVouchers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const raw = await getVoucher();
      const list = Array.isArray(raw) ? raw : raw?.data ?? [];
      setVouchers(list.map(normalizeVoucher));
    } catch (err) {
      setError("Gagal memuat data voucher. Coba muat ulang.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  // ── Filtered list ──
  const filtered = vouchers.filter((v) =>
    v.code?.toLowerCase().includes(search.toLowerCase())
  );

  // ── Handlers ──
  const handleCreate = async (payload) => {
    await createVoucher(toPayload(payload));
    await fetchVouchers();
  };

  const handleUpdate = async (payload) => {
    await updateVoucher(formModal.editData.id, toPayload(payload));
    await fetchVouchers();
  };

  const handleDelete = async () => {
    await deleteVoucher(deleteModal.voucher.id);
    await fetchVouchers();
    setDeleteModal({ open: false, voucher: null });
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto pb-10">
      {/* Page Title */}
      <h1 className="text-2xl font-bold text-black mt-2">Voucher</h1>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          id="voucher-search"
          type="text"
          placeholder="Cari voucher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-[#FF7A00] transition-colors placeholder:text-gray-400"
        />
      </div>

      {/* Tambah Button */}
      <button
        id="voucher-tambah-btn"
        onClick={() => setFormModal({ open: true, editData: null })}
        className="w-full bg-[#FF7A00] hover:bg-[#E56E00] text-white font-bold text-sm py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
      >
        <Plus className="w-4 h-4" strokeWidth={2.5} />
        Tambah Voucher
      </button>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchVouchers} className="ml-3 underline font-semibold">
            Coba lagi
          </button>
        </div>
      )}

      {/* Voucher List */}
      <div className="flex flex-col gap-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            {search
              ? `Tidak ada voucher dengan code "${search}".`
              : "Belum ada voucher. Tambahkan voucher baru!"}
          </div>
        ) : (
          filtered.map((v) => (
            <VoucherCard
              key={v.id}
              voucher={v}
              onEdit={(voucher) => setFormModal({ open: true, editData: voucher })}
              onDelete={(voucher) => setDeleteModal({ open: true, voucher })}
            />
          ))
        )}
      </div>

      {/* Form Modal (Tambah / Edit) */}
      <VoucherFormModal
        isOpen={formModal.open}
        onClose={() => setFormModal({ open: false, editData: null })}
        onSubmit={formModal.editData ? handleUpdate : handleCreate}
        editData={formModal.editData}
      />

      {/* Delete Confirm Modal */}
      <DeleteModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, voucher: null })}
        onConfirm={handleDelete}
        voucher={deleteModal.voucher}
      />
    </div>
  );
}
