"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  IconLayoutDashboard, 
  IconHistory, 
  IconToolsKitchen2, 
  IconTicket, 
  IconLogout, 
  IconUser
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { getUser, logoutUser } from "@/services/auth";

export default function SidebarContent() {
  const pathname = usePathname();
  
  // 1. Tambahkan state untuk mendeteksi apakah komponen sudah di-mount di browser
  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState(null);

  // 2. Gunakan useEffect untuk mengambil data user hanya di sisi client (browser)
  useEffect(() => {
    setUser(getUser());
    setIsMounted(true);
  }, []);

  const menuItemsKasir = [
    { name: "Pesanan", href: "/penjaga/order", icon: IconLayoutDashboard },
    { name: "Riwayat", href: "/penjaga/history", icon: IconHistory },
  ];

  const menuItemsAdmin = [
    { name: "Dashboard", href: "/admin/dashboard", icon: IconLayoutDashboard },
    { name: "Riwayat", href: "/admin/history", icon: IconHistory },
    { name: "Menu", href: "/admin/menu", icon: IconToolsKitchen2 },
    { name: "Voucher", href: "/admin/voucher", icon: IconTicket },
    { name: "Akun", href: "/admin/account", icon: IconUser },
  ];

  const handleLogout = () => {
    logoutUser(); 
    window.location.href = "/"; 
  };

  // 3. Mencegah Hydration Mismatch: Jangan render struktur menu sebelum mounted
  if (!isMounted) {
    return (
      <div className="flex flex-col h-full bg-white px-4 py-6">
        <div className="w-full h-fit">
          <Image src="/logo.png" alt="Living Room Logo" width={200} height={50} className="object-contain" priority />
        </div>
        {/* Tampilkan area kosong/skeleton sementara agar server dan client sama */}
        <nav className="flex-1 flex flex-col mt-6"></nav>
      </div>
    );
  }

  // Pilih menu berdasarkan role user yang sudah didapatkan
  const activeMenu = user?.role === "PENJAGA" ? menuItemsKasir : menuItemsAdmin;

  return (
    <div className="flex flex-col h-full bg-white px-4 py-6">
      {/* 1. Area Logo */}
      <div className="w-full h-fit">
        <Image 
          src="/logo.png" 
          alt="Living Room Logo" 
          width={200} 
          height={50} 
          className="object-contain"
          priority
        />
      </div>

      {/* 2. Menu Navigasi */}
      {/* (Saya merapikan logikanya agar tidak menulis kode mapping 2x) */}
      <nav className="flex-1 flex flex-col mt-6 gap-1">
        {activeMenu.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.name} href={item.href} passHref>
              <div
                className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-colors text-lg font-semibold ${
                  isActive
                    ? "bg-gradient-to-br from-orange-500 to-orange-200 text-white" // <-- Catatan: Saya ubah bg-linear-to-br jadi bg-gradient-to-br
                    : "text-neutral-950 hover:bg-orange-50 hover:text-orange-500"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* 3. Tombol Keluar (Logout) */}
      <div className="mt-auto pt-6">
        <Button 
          onClick={handleLogout}
          className="w-full bg-orange-500 hover:bg-orange-700 cursor-pointer text-white flex items-center justify-center gap-2 py-2 px-4 rounded-[8px] min-h-10.5 font-semibold"
        >
          <IconLogout className="w-5 h-5" />
          Keluar
        </Button>
      </div>
    </div>
  );
}