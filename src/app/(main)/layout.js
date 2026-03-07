import { Poppins } from "next/font/google";
import "../globals.css";
import SidebarContent from "@/components/Sidebar";
import Image from "next/image";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export default function AppLayout({ children }) {
  return (
    <div className="flex h-screen bg-[#F8F9FA] overflow-hidden">

      {/* 1. SIDEBAR DESKTOP */}
      <aside className="hidden md:flex w-72 flex-col bg-white border-r shadow-sm z-10">
        <SidebarContent />
      </aside>

      {/* 2. AREA KONTEN UTAMA */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* HEADER MOBILE */}
        <header className="md:hidden flex items-center gap-3 bg-white px-5 py-4 z-10">

          {/* Tombol Drawer Menggunakan Gambar Custom */}
          <Sheet>
            <SheetTrigger asChild>
              <button className="shrink-0 hover:opacity-80 transition-opacity">
                <Image
                  src="/button.png" // Memanggil gambar custom Anda
                  alt="Menu Toggle"
                  width={44} // Ukuran setara w-11 (44px)
                  height={44}
                  className="object-contain" // Rounded ditambahkan jika gambar aslinya kotak lancip
                />
              </button>
            </SheetTrigger>
            <SheetTitle></SheetTitle>

            {/* Drawer Sidebar */}
            <SheetContent side="left" className="p-0 w-72" showCloseButton={false}>
              <SidebarContent />
            </SheetContent>
          </Sheet>

          {/* Logo Living Room */}
          <div className="pt-1">
            <Image
              src="/logo.png"
              alt="Living Room Logo"
              width={160}
              height={45}
              className="object-contain"
              priority
            />
          </div>

        </header>

        {/* 3. RENDER KONTEN HALAMAN */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto bg-white">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}
