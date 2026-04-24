import Image from "next/image";
// Sesuaikan import IconCash dari library yang Anda gunakan (misal: tabler-icons)
import { IconCash } from "@tabler/icons-react"; 

export default function OrderCard({ 
  paymentMethod, 
  itemsString, 
  timeString, 
  totalPrice,
  onClick // Opsional: Tambahkan jika card ini nantinya ingin bisa diklik
}) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center justify-between p-2 bg-orange-100 rounded-xl hover:border hover:border-orange-300 min-h-14 ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center gap-4">
        
        {/* Ikon Pembayaran */}
        <div className="flex items-center justify-center w-12 h-12 bg-white border border-orange-300 rounded-lg shrink-0">
          {paymentMethod === "QRIS" ? (
            <Image 
              width={28} 
              height={13} 
              src={"/qris.svg"} 
              alt="qris" 
              className="w-7 h-[13px] text-neutral-700" // Note: h-3.25 diganti h-[13px] agar tailwind valid
            />
          ) : (
            <IconCash className="w-6 h-[22px] text-neutral-700" /> // Note: h-5.5 diganti h-[22px]
          )}
        </div>

        {/* Info Pesanan */}
        <div className="flex flex-col max-w-[150px] sm:max-w-xs">
          <span className="font-semibold text-black text-sm truncate">
            {itemsString}
          </span>
          <span className="text-sm text-black">
            {timeString}
          </span>
        </div>

      </div>

      {/* Harga */}
      <span className="font-bold text-orange-500 text-sm shrink-0">
        Rp {totalPrice.toLocaleString("id-ID")}
      </span>
    </div>
  );
}