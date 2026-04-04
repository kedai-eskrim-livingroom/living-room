"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getMenuPenjaga } from "@/utils/api/penjaga/menu";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatRupiah(amount) {
  return (
    "Rp." +
    Number(amount).toLocaleString("id-ID", { minimumFractionDigits: 0 })
  );
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-[#F5E6C8] overflow-hidden animate-pulse">
      <div className="aspect-square bg-[#F5E6C8]" />
      <div className="px-3 py-3 space-y-2">
        <div className="h-3 bg-[#F5E6C8] rounded w-3/4 mx-auto" />
        <div className="h-3 bg-[#FFD9B3] rounded w-1/2 mx-auto" />
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
    setTimeout(() => setTapped(false), 700);
  };

  return (
    <div
      onClick={handleAdd}
      className={`bg-white rounded-2xl border border-[#F5E6C8] overflow-hidden cursor-pointer transition-all duration-200 active:scale-95 ${
        tapped ? "ring-2 ring-[#FF8C42]" : ""
      }`}
    >
      {/* Image */}
      <div className="relative w-full aspect-square bg-[#FFF8EE] flex items-center justify-center overflow-hidden">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
        ) : null}
        {/* Fallback emoji */}
        <div
          className="absolute inset-0 items-center justify-center text-5xl"
          style={{ display: item.image ? "none" : "flex" }}
        >
          🍦
        </div>

        {/* Tap feedback overlay */}
        {tapped && (
          <div className="absolute inset-0 bg-[#FF8C42]/10 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-[#FF8C42] flex items-center justify-center shadow-md">
              <span className="text-white text-lg font-bold">✓</span>
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-2 py-2.5 text-center">
        <p className="text-[#2D2013] font-semibold text-sm leading-tight">
          {item.name}
        </p>
        <p className="text-[#FF8C42] font-bold text-sm mt-0.5">
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
  const [search, setSearch] = useState("");
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

  const filtered = menus.filter((m) =>
    m.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FFFBF5]">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#F5E6C8] px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#FF8C42] rounded-lg flex items-center justify-center shadow-sm shrink-0">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-1.5">
                {/* Flame icon */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#FF8C42">
                  <path d="M12 2C9.5 5 8 7.5 9.5 10.5c-1.5-1-2-2.5-1.5-4C5 9 4 12 6 14.5c-1.5-.5-2-1.5-2-2.5C2 16 4 20 9 21.5c-1-.5-1.5-1.5-1-2.5C9.5 21 11 21.5 12 21.5c4.5 0 8-3.5 8-8 0-5-4-8-8-11.5z" />
                </svg>
                <span className="text-[#2D2013] font-extrabold text-base tracking-tight">
                  LIVINGROOM
                </span>
              </div>
              <span className="text-[#B89A6A] text-[9px] tracking-widest uppercase">
                The Genuine Fashion Outlet
              </span>
            </div>
          </div>

          {/* Cart icon */}
          <button className="relative w-9 h-9 flex items-center justify-center">
            <span className="text-2xl">🛒</span>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#FF8C42] text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="max-w-md mx-auto px-4 pb-32">
        {/* Title */}
        <div className="pt-5 pb-4">
          <h1 className="text-2xl font-extrabold text-[#2D2013]">Pesanan</h1>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C4A882] text-base">
            🔍
          </span>
          <input
            type="text"
            placeholder="Cari menu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#F0DEC0] rounded-xl text-sm text-[#2D2013] placeholder-[#C4A882] focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/30 focus:border-[#FF8C42] transition-colors"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
            ⚠️ {error}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-[#C4A882]">
            <div className="text-5xl mb-3">🍦</div>
            <p className="font-semibold text-sm">Menu tidak ditemukan</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((item) => (
              <MenuCard key={item.id} item={item} onAdd={handleAddToCart} />
            ))}
          </div>
        )}
      </main>

      {/* ── Cart Bar (bottom) ── */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-5 pt-2 bg-gradient-to-t from-[#FFFBF5] via-[#FFFBF5]/90 to-transparent">
          <button className="w-full max-w-md mx-auto flex items-center justify-between bg-[#FF8C42] hover:bg-[#e57a35] active:scale-[0.98] transition-all text-white rounded-2xl px-5 py-4 shadow-lg shadow-[#FF8C42]/30 block">
            <div className="flex items-center gap-2">
              <span className="text-xl">🛒</span>
              <span className="font-bold text-sm">{totalItems} item</span>
            </div>
            <span className="font-bold text-sm">{formatRupiah(totalPrice)}</span>
          </button>
        </div>
      )}

      {/* ── Toast ── */}
      {showToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div className="bg-[#2D2013] text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg whitespace-nowrap animate-bounce">
            ✓ Ditambahkan ke keranjang
          </div>
        </div>
      )}
    </div>
  );
}