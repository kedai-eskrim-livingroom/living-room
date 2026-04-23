"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, X, Search } from "lucide-react";

import {
  getMenuAdmin,
  createMenu,
  updateMenu,
  deleteMenu,
} from "@/utils/api/admin/menu";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

function formatRupiah(value) {
  const num = String(value ?? "").replace(/\D/g, "");
  return num ? parseInt(num, 10).toLocaleString("id-ID") : "";
}

function parseRupiah(value) {
  return parseInt(String(value ?? "").replace(/\D/g, "") || "0", 10);
}

function normalizeMenu(m) {
  return {
    id: m.id,
    name: m.name ?? "",
    description: m.description ?? "",
    price: m.price ?? 0,
    photo: m.photo ?? "",
  };
}

function buildFormData({ name, description, price, photoFile, photo }) {
  const fd = new FormData();
  fd.append("name", name);
  fd.append("description", description);
  fd.append("price", String(price));
  if (photoFile) {
    fd.append("photo", photoFile);
  } else if (photo) {
    fd.append("photo", photo);
  }
  return fd;
}

function MenuFormModal({ isOpen, onClose, onSubmit, editData }) {
  const isEdit = !!editData;

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    photoFile: null,
    photo: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (isEdit && editData) {
      setForm({
        name: editData.name ?? "",
        description: editData.description ?? "",
        price: editData.price != null ? String(editData.price) : "",
        photoFile: null,
        photo: editData.photo ?? "",
      });
    } else {
      setForm({ name: "", description: "", price: "", photoFile: null, photo: "" });
    }
    setErrors({});
  }, [isOpen, isEdit, editData]);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Nama menu wajib diisi.";
    if (!form.description.trim()) errs.description = "Deskripsi wajib diisi.";

    const priceNum = parseRupiah(form.price);
    if (!form.price) errs.price = "Harga wajib diisi.";
    else if (priceNum <= 0) errs.price = "Harga harus lebih dari Rp0.";

    if (!isEdit) {
      if (!form.photoFile) errs.photo = "Foto wajib diupload.";
    } else {
      if (!form.photoFile && !form.photo) errs.photo = "Foto wajib ada (upload baru atau pakai foto lama).";
    }
    return errs;
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handlePriceChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    handleChange("price", raw);
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
        name: form.name.trim(),
        description: form.description.trim(),
        price: parseRupiah(form.price),
        photoFile: form.photoFile,
        photo: form.photo,
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
        className="max-w-none! w-[calc(100%-2rem)] sm:max-w-md bg-[#FFF8F0] rounded-3xl! border-none shadow-2xl p-0 gap-0"
      >
        <DialogHeader className="flex flex-row items-center justify-between px-6 pt-6 pb-2">
          <DialogTitle className="text-xl font-bold text-gray-900">
            {isEdit ? "Edit Menu" : "Tambah Menu Baru"}
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

        <div className="px-6 pb-2 pt-4 flex flex-col gap-4">
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
              {errors.submit}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-800">Nama</label>
            <input
              id="menu-name"
              type="text"
              placeholder="Nama menu"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className={`w-full bg-white rounded-xl px-4 py-3 text-sm outline-none border transition-colors placeholder:text-gray-400 ${
                errors.name
                  ? "border-red-400 focus:border-red-500"
                  : "border-gray-200 focus:border-[#FF7A00]"
              }`}
            />
            {errors.name && <p className="text-xs text-red-500 mt-0.5">{errors.name}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-800">Deskripsi</label>
            <textarea
              id="menu-description"
              rows={3}
              placeholder="Deskripsi menu"
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className={`w-full bg-white rounded-xl px-4 py-3 text-sm outline-none border transition-colors placeholder:text-gray-400 resize-none ${
                errors.description
                  ? "border-red-400 focus:border-red-500"
                  : "border-gray-200 focus:border-[#FF7A00]"
              }`}
            />
            {errors.description && (
              <p className="text-xs text-red-500 mt-0.5">{errors.description}</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-800">Harga</label>
            <input
              id="menu-price"
              type="text"
              inputMode="numeric"
              placeholder="Rp0.000"
              value={form.price ? `Rp${formatRupiah(form.price)}` : ""}
              onChange={handlePriceChange}
              className={`w-full bg-white rounded-xl px-4 py-3 text-sm outline-none border transition-colors placeholder:text-gray-400 ${
                errors.price
                  ? "border-red-400 focus:border-red-500"
                  : "border-gray-200 focus:border-[#FF7A00]"
              }`}
            />
            {errors.price && <p className="text-xs text-red-500 mt-0.5">{errors.price}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-800">Foto</label>

            {isEdit && form.photo && !form.photoFile ? (
              <div className="flex items-center gap-3">
                <img
                  src={form.photo}
                  alt="Foto menu"
                  className="w-16 h-16 rounded-xl object-cover border border-orange-100"
                />
                <div className="text-xs text-gray-500">
                  Menggunakan foto lama. Upload file baru jika ingin mengganti.
                </div>
              </div>
            ) : null}

            <input
              id="menu-photo"
              type="file"
              accept="image/*"
              onChange={(e) => handleChange("photoFile", e.target.files?.[0] ?? null)}
              className={`w-full bg-white rounded-xl px-4 py-3 text-sm outline-none border transition-colors ${
                errors.photo
                  ? "border-red-400 focus:border-red-500"
                  : "border-gray-200 focus:border-[#FF7A00]"
              }`}
            />
            {errors.photo && <p className="text-xs text-red-500 mt-0.5">{errors.photo}</p>}
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
            id="menu-submit-btn"
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

function DeleteModal({ isOpen, onClose, onConfirm, menu }) {
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
      setDeleteError(err?.response?.data?.message ?? "Gagal menghapus menu. Coba lagi.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-none! w-[calc(100%-2rem)] sm:max-w-xs bg-[#FFF8F0] rounded-3xl! border-none shadow-2xl p-6 gap-0"
      >
        <VisuallyHidden>
          <DialogTitle>Konfirmasi Hapus Menu</DialogTitle>
        </VisuallyHidden>
        <div className="flex flex-col items-center text-center gap-3">
          <h2 className="text-lg font-bold text-gray-900">
            Hapus menu <span className="text-[#FF7A00]">{menu?.name}</span>?
          </h2>
          <p className="text-sm text-gray-500">
            Anda yakin ingin menghapus menu <span className="font-semibold">{menu?.name}</span>?
          </p>
          {deleteError && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-xl px-3 py-2 w-full">
              {deleteError}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 mt-6">
          <button
            id="menu-delete-confirm-btn"
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

function MenuCard({ menu, onEdit, onDelete }) {
  return (
    <div className="flex items-stretch rounded-2xl overflow-hidden shadow-sm border border-orange-100">
      <div className="w-24 bg-[#FFF0DC] flex items-center justify-center overflow-hidden">
        {menu.photo ? (
          <img
            src={menu.photo}
            alt={menu.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
              if (e.target.nextSibling) e.target.nextSibling.style.display = "flex";
            }}
          />
        ) : null}
        <div
          className="w-full h-full items-center justify-center text-3xl"
          style={{ display: menu.photo ? "none" : "flex" }}
        >
          🍦
        </div>
      </div>

      <div className="flex-1 bg-[#FFF8F0] px-4 py-4 flex flex-col justify-center">
        <p className="text-gray-900 font-bold text-base leading-tight truncate">{menu.name}</p>
        <p className="text-gray-500 text-xs mt-1 line-clamp-2">{menu.description}</p>
        <p className="text-[#FF7A00] font-bold text-sm mt-2">Rp{formatRupiah(menu.price)}</p>
      </div>

      <div className="flex flex-col">
        <button
          onClick={() => onEdit(menu)}
          className="flex-1 bg-[#DDEEFF] hover:bg-[#C4DDFF] flex items-center justify-center px-4 transition-colors"
          title="Edit menu"
        >
          <Pencil className="w-4 h-4 text-[#2563EB]" />
        </button>
        <button
          onClick={() => onDelete(menu)}
          className="flex-1 bg-[#FFE0E8] hover:bg-[#FFC7D4] flex items-center justify-center px-4 transition-colors"
          title="Hapus menu"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </button>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="flex items-stretch rounded-2xl overflow-hidden shadow-sm border border-orange-100 animate-pulse">
      <div className="bg-orange-100 w-24 min-h-[96px]" />
      <div className="flex-1 bg-orange-50 px-4 py-4 flex flex-col justify-center gap-2">
        <div className="h-4 bg-orange-200 rounded w-3/4" />
        <div className="h-3 bg-orange-100 rounded w-2/3" />
        <div className="h-3 bg-orange-100 rounded w-1/2" />
      </div>
      <div className="flex flex-col w-12">
        <div className="flex-1 bg-blue-100" />
        <div className="flex-1 bg-pink-100" />
      </div>
    </div>
  );
}

export default function MenuAdminPage() {
  const [menus, setMenus] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formModal, setFormModal] = useState({ open: false, editData: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, menu: null });

  const fetchMenus = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const raw = await getMenuAdmin();
      const list = Array.isArray(raw) ? raw : raw?.data ?? [];
      setMenus(list.map(normalizeMenu));
    } catch (err) {
      setError("Gagal memuat data menu. Coba muat ulang.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return menus.filter((m) => m.name?.toLowerCase().includes(q));
  }, [menus, search]);

  const handleCreate = async (payload) => {
    const fd = buildFormData(payload);
    await createMenu(fd);
    await fetchMenus();
  };

  const handleUpdate = async (payload) => {
    const fd = buildFormData(payload);
    await updateMenu(formModal.editData.id, fd);
    await fetchMenus();
  };

  const handleDelete = async () => {
    await deleteMenu(deleteModal.menu.id);
    await fetchMenus();
    setDeleteModal({ open: false, menu: null });
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto pb-10">
      <h1 className="text-2xl font-bold text-neutral-900 mt-2">Menu</h1>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          id="menu-search"
          type="text"
          placeholder="Cari menu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-[#FF7A00] transition-colors placeholder:text-gray-400"
        />
      </div>

      <button
        id="menu-tambah-btn"
        onClick={() => setFormModal({ open: true, editData: null })}
        className="w-full bg-[#FF7A00] hover:bg-[#E56E00] text-white font-bold text-sm py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
      >
        <Plus className="w-4 h-4" strokeWidth={2.5} />
        Tambah Menu
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchMenus} className="ml-3 underline font-semibold">
            Coba lagi
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            {search ? `Tidak ada menu dengan nama \"${search}\".` : "Belum ada menu. Tambahkan menu baru!"}
          </div>
        ) : (
          filtered.map((m) => (
            <MenuCard
              key={m.id}
              menu={m}
              onEdit={(menu) => setFormModal({ open: true, editData: menu })}
              onDelete={(menu) => setDeleteModal({ open: true, menu })}
            />
          ))
        )}
      </div>

      <MenuFormModal
        isOpen={formModal.open}
        onClose={() => setFormModal({ open: false, editData: null })}
        onSubmit={formModal.editData ? handleUpdate : handleCreate}
        editData={formModal.editData}
      />

      <DeleteModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, menu: null })}
        onConfirm={handleDelete}
        menu={deleteModal.menu}
      />
    </div>
  );
}
