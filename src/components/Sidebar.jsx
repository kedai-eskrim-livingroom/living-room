"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  LayoutGrid, 
  History, 
  Utensils, 
  Ticket, 
  LogOut 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutUser } from "@/utils/auth";


// Daftar menu navigasi sesuai desain
const menuItems = [
  { name: "Pesanan", href: "/pesanan", icon: LayoutGrid },
  { name: "Riwayat", href: "/riwayat", icon: History },
  { name: "Menu", href: "/menu", icon: Utensils },
  { name: "Voucher", href: "/voucher", icon: Ticket },
];

export default function SidebarContent() {
  // Mengambil URL saat ini untuk efek menu aktif
  const pathname = usePathname();

  const handleLogout = () => {
    logoutUser(); // Menghapus cookie token
    window.location.href = "/login"; // Redirect ke halaman login
  };

  return (
    <div className="flex flex-col h-full bg-white px-4 py-6">
      {/* 1. Area Logo */}
      <div className="w-full h-fit">
        {/* Pastikan file logo.png ada di folder public/ */}
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
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.name} href={item.href} passHref>
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-lg font-semibold ${
                  isActive
                    ? "bg-linear-to-br from-orange-500 to-orange-200 text-white shadow-sm" 
                    : "text-gray-800 hover:bg-orange-50 hover:text-orange-500"
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
          className="w-full bg-[#FF7A00] hover:bg-[#E56E00] text-white flex items-center justify-center gap-2 py-6 rounded-lg font-semibold shadow-sm"
        >
          <LogOut className="w-5 h-5" />
          Keluar
        </Button>
      </div>
    </div>
  );
}