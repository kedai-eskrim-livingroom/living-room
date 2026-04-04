"use client";

import { useState, useEffect } from "react";
import { getMenuPenjaga } from "./menu";
import Image from "next/image";

// Fallback data jika API belum tersedia
const FALLBACK_MENUS = [
  { id: 1, name: "1 Scoop", price: 4000, image: "/images/1scoop.jpg" },
  { id: 2, name: "2 Scoop", price: 7000, image: "/images/2scoop.jpg" },
  { id: 3, name: "Es Cemil", price: 10000, image: "/images/escemil.jpg" },
  { id: 4, name: "Ice cream cup", price: 5000, image: "/images/icecreamcup.jpg" },
  { id: 5, name: "Kul - kul", price: 2500, image: "/images/kulkul.jpg" },
  { id: 6, name: "Muffle", price: 8000, image: "/images/muffle.jpg" },
  { id: 7, name: "Waffle", price: 8000, image: "/images/waffle.jpg" },
  { id: 8, name: "Croffle", price: 12000, image: "/images/croffle.jpg" },
  { id: 9, name: "Soda float", price: 8000, image: "/images/sodafloat.jpg" },
  { id: 10, name: "Hot dog", price: 8000, image: "/images/hotdog.jpg" },
];

function formatRupiah(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  })
    .format(amount)
    .replace("IDR", "Rp.");
}

function MenuCard({ item, onAdd }) {
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    setAdded(true);
    onAdd(item);
    setTimeout(() => setAdded(false), 800);
  };

  return (
    <div
      className="menu-card group relative bg-[#FFF8EE] rounded-2xl overflow-hidden border border-[#F5E6C8] shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col"
      onClick={handleAdd}
    >
      {/* Image area */}
      <div className="relative w-full aspect-square bg-[#FFF3DE] overflow-hidden flex items-center justify-center">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
        ) : null}
        {/* Placeholder icon jika gambar tidak ada */}
        <div
          className="absolute inset-0 flex items-center justify-center text-5xl"
          style={{ display: item.image ? "none" : "flex" }}
        >
          🍦
        </div>

        {/* Add button overlay */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
            added ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
              added
                ? "bg-green-500 scale-110"
                : "bg-[#FF8C42] hover:bg-[#FF7A2E]"
            }`}
          >
            <span className="text-white text-xl font-bold leading-none">
              {added ? "✓" : "+"}
            </span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="px-3 py-3 flex flex-col gap-1">
        <p className="font-semibold text-[#2D2013] text-sm leading-tight text-center">
          {item.name}
        </p>
        <p className="text-[#FF8C42] font-bold text-sm text-center">
          {formatRupiah(item.price)}
        </p>
      </div>
    </div>
  );
}

function CartToast({ count }) {
  if (count === 0) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-bounce-in">
      <div className="bg-[#FF8C42] text-white px-5 py-3 rounded-full shadow-xl flex items-center gap-2 font-semibold text-sm whitespace-nowrap">
        <span>🛒</span>
        <span>{count} item dalam keranjang</span>
      </div>
    </div>
  );
}

export default function Order() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastTimeout, setToastTimeout] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchMenus() {
      try {
        const data = await getMenuPenjaga();
        setMenus(data?.data || data || FALLBACK_MENUS);
      } catch (err) {
        console.error("Gagal fetch menu:", err);
        setMenus(FALLBACK_MENUS);
        setError("Menampilkan data contoh.");
      } finally {
        setLoading(false);
      }
    }
    fetchMenus();
  }, []);

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
    if (toastTimeout) clearTimeout(toastTimeout);
    const t = setTimeout(() => setShowToast(false), 2500);
    setToastTimeout(t);
  };

  const totalItems = cart.reduce((sum, c) => sum + c.qty, 0);

  const filteredMenus = menus.filter((m) =>
    m.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FFFBF5] font-['Nunito',sans-serif]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#F5E6C8] px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          {/* Logo area */}
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 bg-[#FF8C42] rounded-lg flex items-center justify-center shadow">
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
            </button>
            <div className="flex flex-col leading-tight">
              <span className="text-[#2D2013] font-extrabold text-base tracking-tight">
                LIVINGROOM
              </span>
              <span className="text-[#B89A6A] text-[9px] tracking-widest uppercase">
                The Genuine Fashion Outlet
              </span>
            </div>
          </div>

          {/* Cart button */}
          <button className="relative w-9 h-9 flex items-center justify-center">
            <span className="text-2xl">🛒</span>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#FF8C42] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-md mx-auto px-4 pb-28">
        {/* Page title */}
        <div className="pt-5 pb-3">
          <h1 className="text-2xl font-extrabold text-[#2D2013] tracking-tight">
            Pesanan
          </h1>
          <p className="text-[#B89A6A] text-sm mt-0.5">
            Pilih menu favoritmu 🍦
          </p>
        </div>

        {/* Search bar */}
        <div className="mb-4 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C4A882]">
            🔍
          </span>
          <input
            type="text"
            placeholder="Cari menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#F0DEC0] rounded-xl text-sm text-[#2D2013] placeholder-[#C4A882] focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/30 focus:border-[#FF8C42]"
          />
        </div>

        {/* Error notice */}
        {error && (
          <div className="mb-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
            ⚠️ {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-[#FFF8EE] rounded-2xl overflow-hidden border border-[#F5E6C8] animate-pulse"
              >
                <div className="aspect-square bg-[#F5E6C8]" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-[#F5E6C8] rounded w-3/4 mx-auto" />
                  <div className="h-3 bg-[#FFD9B3] rounded w-1/2 mx-auto" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredMenus.length === 0 ? (
          <div className="text-center py-20 text-[#C4A882]">
            <div className="text-5xl mb-3">🍦</div>
            <p className="font-semibold">Menu tidak ditemukan</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredMenus.map((item) => (
              <MenuCard key={item.id} item={item} onAdd={handleAddToCart} />
            ))}
          </div>
        )}
      </main>

      {/* Cart Toast */}
      {showToast && <CartToast count={totalItems} />}

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap");

        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(20px) scale(0.9);
          }
          60% {
            transform: translateX(-50%) translateY(-4px) scale(1.02);
          }
          100% {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
          }
        }

        .animate-bounce-in {
          animation: bounce-in 0.35s ease-out forwards;
        }
      `}</style>
    </div>
  );
}