"use client";

import { useState, useEffect } from "react";
import { getMenuPenjaga } from "@/utils/api/penjaga/menu";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatRupiah(amount) {
  if (!amount && amount !== 0) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  })
    .format(amount)
    .replace("IDR\u00a0", "Rp");
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-200" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-orange-200 rounded w-1/2" />
      </div>
    </div>
  );
}

// ─── Menu Card ────────────────────────────────────────────────────────────────
function MenuCard({ item, onAdd }) {
  const [tapped, setTapped] = useState(false);

  const handleAdd = () => {
    setTapped(true);
    onAdd(item);
    setTimeout(() => setTapped(false), 300);
  };

  return (
    <div
      onClick={handleAdd}
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md hover:border-orange-200 active:scale-95 ${
        tapped ? "ring-2 ring-[#FF8C42]" : ""
      }`}
    >
      {/* Area Gambar */}
      <div className="relative w-full aspect-square bg-orange-50 flex items-center justify-center overflow-hidden">
        {item.photo ? (
          <img
            src={item.photo}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
        ) : null}
        
        {/* Fallback emoji jika gambar tidak ada/error */}
        <div
          className="absolute inset-0 items-center justify-center text-5xl bg-gray-50"
          style={{ display: item.photo ? "none" : "flex" }}
        >
          🍦
        </div>

        {/* Efek klik */}
        {tapped && (
          <div className="absolute inset-0 bg-[#FF8C42]/20 flex items-center justify-center backdrop-blur-[1px]">
            <div className="w-12 h-12 rounded-full bg-[#FF8C42] flex items-center justify-center shadow-lg transform scale-in">
              <span className="text-white text-xl font-bold">✓</span>
            </div>
          </div>
        )}
      </div>

      {/* Info Menu */}
      <div className="p-4">
        <p className="text-gray-900 font-bold text-sm mb-1 truncate">
          {item.name}
        </p>
        <p className="text-[#FF8C42] font-extrabold text-sm">
          {formatRupiah(item.price)}
        </p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function OrderPage() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastTimer, setToastTimer] = useState(null);

  // ── Fetch menus ──
  useEffect(() => {
    async function fetchMenus() {
      try {
        const res = await getMenuPenjaga();
        const list = Array.isArray(res) ? res : res?.data ?? [];
        setMenus(list);
      } catch (err) {
        console.error("Gagal fetch menu:", err);
        setError("Gagal memuat menu. Periksa koneksi Anda.");
      } finally {
        setLoading(false);
      }
    }
    fetchMenus();
  }, []);

  // ── Cart logic ──
  const handleAddToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.id === item.id ? { ...c, qty: c.qty + 1 } : c
        );
      }
      return [...prev, { ...item, qty: 1 }];
    });

    setShowToast(true);
    if (toastTimer) clearTimeout(toastTimer);
    const t = setTimeout(() => setShowToast(false), 2000);
    setToastTimer(t);
  };

  const totalItems = cart.reduce((sum, c) => sum + c.qty, 0);
  const totalPrice = cart.reduce((sum, c) => sum + c.price * c.qty, 0);

  return (
    <main className="w-full bg-gray-50 min-h-screen p-4 md:p-8 relative pb-24">
      <div className="max-w-6xl mx-auto">
        
        {/* Title */}
        <div className="flex items-center justify-between mb-7">
          <h1 className="text-3xl font-bold text-gray-900">Pesanan</h1>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="mb-6 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-medium">
            ⚠️ {error}
          </div>
        )}

        {/* Grid Container */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : menus.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 border-dashed mt-4">
            <span className="text-6xl mb-4 grayscale opacity-40">🍦</span>
            <p className="font-semibold text-gray-500">Menu belum tersedia</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {menus.map((item) => (
              <MenuCard key={item.id} item={item} onAdd={handleAddToCart} />
            ))}
          </div>
        )}
      </div>

      {/* ── Cart Bar (Floating di bawah layar) ── */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 md:left-64 z-40 px-4 md:px-8 pb-6 pt-4 bg-gradient-to-t from-gray-50 via-gray-50/90 to-transparent pointer-events-none">
          <div className="max-w-6xl mx-auto flex justify-end pointer-events-auto">
            <button className="flex items-center gap-6 bg-[#FF8C42] hover:bg-orange-500 active:scale-[0.98] transition-all text-white rounded-2xl px-6 py-4 shadow-xl shadow-orange-500/20">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-xs font-medium text-orange-100 uppercase tracking-wider">Keranjang</p>
                  <p className="font-bold text-lg leading-none">{totalItems} Item</p>
                </div>
              </div>
              <div className="h-10 w-[1px] bg-white/20 mx-2"></div>
              <span className="font-extrabold text-xl">{formatRupiah(totalPrice)}</span>
              <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Toast Notification ── */}
      {showToast && (
        <div className="fixed top-8 left-1/2 md:left-[calc(50%+8rem)] -translate-x-1/2 z-50 pointer-events-none transition-all">
          <div className="bg-gray-900/90 backdrop-blur-sm text-white text-sm font-semibold px-6 py-3 rounded-full shadow-2xl flex items-center gap-3">
            <span className="bg-green-500 rounded-full p-1">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </span>
            Ditambahkan ke keranjang
          </div>
        </div>
      )}
    </main>
  );
}