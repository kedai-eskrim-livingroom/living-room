"use client";

import { useState } from "react";
import useSWR from "swr";
import Image from "next/image";

import { getMenuPenjaga } from "@/utils/api/penjaga/menu";
import { validateVoucher } from "@/utils/api/penjaga/voucher";
import { createOrder } from "@/utils/api/penjaga/order";

import {
  IconReceipt, IconArrowNarrowLeft, IconTicket,
  IconChevronRight, IconQrcode, IconCashBanknote,
  IconDeviceFloppy, IconX, IconLoader2, IconCheck
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const fetcher = async () => {
  const response = await getMenuPenjaga();
  return response?.data ? response.data : (Array.isArray(response) ? response : []);
};

export default function POSPage() {
  const [activeScreen, setActiveScreen] = useState("catalog");
  const [cart, setCart] = useState([]);

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const [voucherInput, setVoucherInput] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [isCheckingVoucher, setIsCheckingVoucher] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("QRIS");
  const [isPaymentSheetOpen, setIsPaymentSheetOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { data: menus = [], isLoading: isLoadingMenus, error } = useSWR('menus', fetcher);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 2000);
  };

  const handleItemClick = (menu) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === menu.id);
      if (existing) {
        return prev.map((item) => item.id === menu.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...menu, qty: 1 }];
    });
  };

  // PERBAIKAN: Item akan terhapus jika qty mencapai 0
  const updateQty = (id, delta) => {
    setCart((prev) => {
      const newCart = prev
        .map((item) => {
          if (item.id === id) {
            return { ...item, qty: item.qty + delta };
          }
          return item;
        })
        .filter((item) => item.qty > 0); // Hapus item yang qty-nya 0

      // UX Tambahan: Jika di HP layar keranjang kosong karena dihapus, otomatis balik ke katalog
      if (newCart.length === 0 && activeScreen === "cart" && window.innerWidth < 1024) {
        setActiveScreen("catalog");
      }

      return newCart;
    });
  };

  const totalItems = cart.reduce((total, item) => total + item.qty, 0);
  const subTotal = cart.reduce((total, item) => total + (item.price * item.qty), 0);
  const grandTotal = Math.max(0, subTotal - discount);

  const handleApplyVoucher = async () => {
    if (!voucherInput.trim()) return;
    try {
      setIsCheckingVoucher(true);
      const res = await validateVoucher({ code: voucherInput.toUpperCase() });
      setAppliedVoucher(res.data || res);
      setDiscount(res.data?.discount || res?.discount || 0);
      showToast("Voucher berhasil digunakan!", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Voucher tidak valid / kedaluwarsa.", "error");
      setAppliedVoucher(null);
      setDiscount(0);
    } finally {
      setIsCheckingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    setVoucherInput("");
    setAppliedVoucher(null);
    setDiscount(0);
  };

  const handleSaveOrder = async () => {
    if (cart.length === 0) return showToast("Keranjang masih kosong!", "error");
    try {
      setIsSaving(true);
      const payload = {
        paymentMethod: paymentMethod,
        voucherId: appliedVoucher ? appliedVoucher.id : null,
        items: cart.map(item => ({
          menuId: item.id,
          qty: item.qty,
          price: item.price
        }))
      };
      await createOrder(payload);

      showToast("Pesanan berhasil disimpan!", "success");
      setCart([]);
      handleRemoveVoucher();
      setActiveScreen("catalog");
    } catch (err) {
      showToast("Gagal menyimpan pesanan. Silakan coba lagi.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen font-poppins relative overflow-x-hidden">

      {/* =========================================
          SISI KIRI: KATALOG MENU
          ========================================= */}
      <div className={`flex-1 flex flex-col bg-white relative pb-32 lg:pb-8 lg:min-h-screen ${activeScreen === "cart" ? "hidden lg:flex" : "flex"}`}>

        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">Pesanan</h1>
        </div>

        {isLoadingMenus ? (
          <div className="flex justify-center py-20"><IconLoader2 className="animate-spin text-orange-500 w-10 h-10" /></div>
        ) : error ? (
          <div className="text-center text-red-500 py-10">Gagal memuat menu.</div>
        ) : menus.length === 0 ? (
          <div className="text-center text-gray-500 py-10">Belum ada data menu.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4 overflow-x-auto py-2">
            {menus.map((menu) => {
              const currentQty = cart.find((item) => item.id === menu.id)?.qty || 0;
              return (
                <div
                  key={menu.id}
                  onClick={() => handleItemClick(menu)}
                  className="bg-orange-100 rounded-[16px] min-w-42 min-h-57 p-2 flex flex-col items-center cursor-pointer hover:shadow-md transition-all active:scale-95 relative select-none"
                >
                  {currentQty > 0 && (
                    <div className="absolute -top-2 -right-2 bg-orange-500 text-white font-bold text-xs w-7 h-7 flex items-center justify-center rounded-full shadow-md z-10 border-2 border-white animate-in zoom-in duration-200">
                      {currentQty}
                    </div>
                  )}
                  <div className="w-full aspect-square bg-white rounded-[8px] mb-3 flex items-center justify-center overflow-hidden relative shadow-sm">
                    {menu.photo ? (
                      <Image src={menu.photo} alt={menu.name} fill sizes="50vw" className="object-cover bg-white" />
                    ) : (
                      <span className="text-xs text-gray-400">No Image</span>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm text-center mb-0.5 line-clamp-1">{menu.name}</h3>
                  <p className="font-bold text-orange-500 text-[13px] text-center">Rp.{menu.price.toLocaleString("id-ID")}</p>
                </div>
              );
            })}
          </div>
        )}

        <div className={`lg:hidden fixed bottom-0 left-0 right-0 w-full z-40 transition-transform duration-300 ease-in-out blur-out-xs ${totalItems > 0 ? "translate-y-0" : "translate-y-full"}`}>
          <div className="bg-neutral-50 rounded-t-[32px] pt-4 pb-6 px-5 shadow-[0_-15px_40px_rgba(0,0,0,0.08)] border-t border-gray-300">
            <button
              onClick={() => setActiveScreen("cart")}
              className="w-full bg-orange-500 hover:bg-orange-700 active:scale-[0.98] transition-all text-white rounded-2xl p-4 px-5 flex items-center justify-between shadow-lg shadow-orange-500/20"
            >
              <div className="flex flex-col text-left text-white">
                <span className="font-semibold text-[20px] leading-tight">{totalItems} Item</span>
                <span className="text-base">Masuk ke dalam list order</span>
              </div>
              <IconReceipt className="w-8 h-8 text-white" stroke={2} />
            </button>
          </div>
        </div>
      </div>

      {/* =========================================
          SISI KANAN: KERANJANG (CART)
          ========================================= */}
      <div className={`w-full lg:w-[400px] xl:w-[450px] flex flex-col lg:shadow-[-10px_0_30px_rgba(0,0,0,0.03)] lg:h-screen lg:sticky lg:top-0 ${activeScreen === "catalog" ? "hidden lg:flex" : "flex"}`}>

        <header className="flex lg:hidden items-center pb-4 sticky top-0 z-10 bg-white">
          <button
            onClick={() => setActiveScreen("catalog")}
            className="p-2 -ml-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            <IconArrowNarrowLeft className="w-6 h-6 text-gray-900" stroke={2.5} />
          </button>
          <h1 className="text-2xl font-semibold text-gray-900 ml-2">Order</h1>
        </header>

        <div className="hidden lg:block py-6 border-b border-gray-200 bg-white">
          <h2 className="text-2xl font-semibold text-gray-900">Order</h2>
        </div>

        {/* LIST ITEM KERANJANG */}
        <div className="flex-1 overflow-y-auto py-4 gap-4 flex flex-col pb-[320px] lg:pb-4">
          {cart.length === 0 && (
            <div className="m-auto text-center text-gray-400 flex flex-col items-center gap-2">
              <IconReceipt className="w-12 h-12 opacity-50" />
              <p>Keranjang masih kosong</p>
            </div>
          )}
          {cart.map((item) => (
            <div key={item.id} className="flex items-center bg-orange-100 rounded-[16px] min-h-25 p-2 shadow-sm">
              <div className="w-21 h-21 bg-white rounded-[8px] flex shrink-0 items-center justify-center overflow-hidden relative">
                {item.photo ? (
                  <Image src={item.photo} alt={item.name} fill sizes="84px" className="object-cover" />
                ) : (
                  <span className="text-[10px] text-gray-400">Img</span>
                )}
              </div>
              <div className="flex flex-col ml-3 flex-1">
                <span className="font-semibold text-black text-[16px] line-clamp-1">{item.name}</span>
                <span className="font-semibold text-orange-500 text-sm mt-0.5">Rp.{item.price.toLocaleString("id-ID")}</span>
              </div>

              {/* Pill Kuantitas Putih */}
              <div className="flex items-center bg-neutral-50 backdrop-blur-sm rounded-[8px] border border-white p-1 px-2 shrink-0 shadow-sm">
                <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 flex items-center justify-center text-gray-900 hover:bg-gray-100 rounded-full transition-colors">-</button>
                <span className="w-6 text-center text-gray-900 text-[15px]">{item.qty}</span>
                <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 flex items-center justify-center text-gray-900 hover:bg-gray-100 rounded-full transition-colors">+</button>
              </div>
            </div>
          ))}
        </div>

        {/* AREA TOTAL & AKSI BAWAH */}
        <div className="fixed lg:static bottom-0 left-0 right-0 bg-white lg:bg-gray-50 rounded-t-[32px] lg:rounded-none shadow-[0_-15px_40px_rgba(0,0,0,0.06)] lg:shadow-none border-t border-gray-100 px-5 pt-5 pb-8 lg:py-6 flex flex-col gap-4 z-20 mt-auto">

          {/* INPUT VOUCHER */}
          <div className="flex items-center w-full bg-white border border-gray-900 rounded-[20px] p-1.5 overflow-hidden h-[60px] shadow-sm">
            <div className="flex items-center justify-center w-12 shrink-0">
              <IconTicket className="w-6 h-6 text-gray-900" stroke={1.5} />
            </div>

            {appliedVoucher ? (
              <div className="flex items-center justify-between flex-1 pr-2">

                {/* --- DESAIN TIKET DISKON BARU --- */}
                <div className="relative flex items-center gap-2 bg-linear-to-r from-orange-300 to-orange-100 px-4 py-1.5 rounded-lg overflow-visible min-h-10">
                  {/* Lubang Kiri (Ilusi) */}
                  <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full"></div>
                  {/* Lubang Kanan (Ilusi) */}
                  <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full"></div>

                  {/* Teks Diskon */}
                  <span className="text-[#FF7A00] font-bold text-sm relative z-10">
                    -Rp{discount.toLocaleString("id-ID")}
                  </span>

                  {/* Tombol Hapus (X) */}
                  <button onClick={handleRemoveVoucher} className="hover:text-red-600 transition-colors relative z-10 ml-1">
                    <IconX className="w-4 h-4 text-[#FF7A00]" stroke={3} />
                  </button>
                </div>
                {/* -------------------------------- */}

                <span className="text-xs text-gray-500 font-medium">Dipakai</span>
              </div>
            ) : (
              <>
                <Input
                  value={voucherInput}
                  onChange={(e) => setVoucherInput(e.target.value)}
                  placeholder="KETIK KODE VOUCHER"
                  className="flex-1 border-none shadow-none focus-visible:ring-0 p-0 text-gray-900 placeholder:text-gray-400 font-bold text-[13px] uppercase"
                />
                <Button
                  onClick={handleApplyVoucher}
                  className={`bg-gray-900 hover:bg-gray-800 text-white rounded-xl h-full px-4 font-bold transition-colors ${(!voucherInput.trim()) ? "opacity-0 hidden cursor-not-allowed" : "opacity-100 block"}`}
                >
                  {isCheckingVoucher ? <IconLoader2 className="animate-spin w-5 h-5" /> : "Gunakan"}
                </Button>
              </>
            )}
          </div>

          {/* METODE PEMBAYARAN */}
          <button onClick={() => setIsPaymentSheetOpen(true)} className="flex items-center justify-between w-full bg-white border border-gray-900 rounded-[20px] px-5 py-3 h-[60px] hover:bg-gray-50 transition-colors shadow-sm">
            <div className="flex items-center gap-3">
              {paymentMethod === "QRIS" ? <IconQrcode className="w-6 h-6 text-gray-900" stroke={1.5} /> : <IconCashBanknote className="w-6 h-6 text-gray-900" stroke={1.5} />}
              <span className="font-bold text-gray-900 text-[15px]">{paymentMethod}</span>
            </div>
            <IconChevronRight className="w-5 h-5 text-gray-500" stroke={2} />
          </button>

          {/* TOTAL & SIMPAN */}
          <div className="flex items-center justify-between mt-3 gap-3">
            <div className="flex flex-col">
              <span className="text-neutral-950 text-base">Total</span>
              <span className="text-[20px] font-semibold text-neutral-950 -mt-1 tracking-tight">Rp.{grandTotal.toLocaleString("id-ID")}</span>
            </div>
            <Button
              onClick={handleSaveOrder}
              disabled={isSaving || cart.length === 0}
              className="bg-orange-500 hover:bg-orange-700 text-neutral-50 rounded-2xl h-full py-3 px-4 shadow-md font-semibold disabled:opacity-70 text-[14px]"
            >
              {isSaving ? <IconLoader2 className="w-6 h-6 mr-2 animate-spin" stroke={2.5} /> : <IconDeviceFloppy className="w-6 h-6 mr-2" stroke={2.5} />}
              {isSaving ? "Proses..." : "Simpan Penjualan"}
            </Button>
          </div>
        </div>
      </div>

      {/* =========================================
          SHEET METODE PEMBAYARAN & TOAST
          ========================================= */}

      <Sheet open={isPaymentSheetOpen} onOpenChange={setIsPaymentSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-[32px] p-6 bg-white border-none pb-10">
          <SheetHeader className="mb-6 border-b border-gray-100 pb-4">
            <SheetTitle className="text-xl font-bold text-gray-900 text-left">Metode Pembayaran</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-3">
            <button onClick={() => { setPaymentMethod("CASH"); setIsPaymentSheetOpen(false); }} className={`flex items-center justify-between w-full border ${paymentMethod === "CASH" ? "border-orange-500 bg-orange-100" : "border-gray-200 bg-white"} rounded-2xl px-5 py-4 hover:bg-gray-50 transition-colors`}>
              <div className="flex items-center gap-3"><IconCashBanknote className="w-6 h-6 text-gray-900" stroke={1.5} /><span className="font-bold text-gray-900">Cash</span></div>
              <IconChevronRight className="w-5 h-5 text-gray-400" stroke={2} />
            </button>
            <button onClick={() => { setPaymentMethod("QRIS"); setIsPaymentSheetOpen(false); }} className={`flex items-center justify-between w-full border ${paymentMethod === "QRIS" ? "border-orange-500 bg-orange-100" : "border-gray-200 bg-white"} rounded-2xl px-5 py-4 hover:bg-gray-50 transition-colors`}>
              <div className="flex items-center gap-3"><IconQrcode className="w-6 h-6 text-gray-900" stroke={1.5} /><span className="font-bold text-gray-900">QRIS</span></div>
              <IconChevronRight className="w-5 h-5 text-gray-400" stroke={2} />
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* CUSTOM TOAST NOTIFICATION */}
      {toast.show && (
        <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl transition-all duration-300 animate-in slide-in-from-right-8 ${toast.type === "success" ? "bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]" : "bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]"
          }`}>
          {toast.type === "success" ? <IconCheck className="w-6 h-6" stroke={2.5} /> : <IconX className="w-6 h-6" stroke={2.5} />}
          <span className="font-bold text-sm">{toast.message}</span>
        </div>
      )}

    </div>
  );
}