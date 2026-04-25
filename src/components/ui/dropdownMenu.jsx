"use client";

import * as React from "react";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export default function DropdownMenu({ 
  onEdit, 
  onDelete, 
  className 
}) {
  return (
    <div className={cn(
      "absolute right-0 top-full mt-2 w-48 bg-white border border-neutral-200 rounded-2xl shadow-xl z-50 overflow-hidden py-1",
      className
    )}>
      {/* Edit Button */}
      <button
        onClick={onEdit}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-blue-500 group cursor-pointer"
      >
        <IconPencil size={20} stroke={2} />
        <span className="font-semibold text-base">Edit Akun</span>
      </button>

      {/* Separator */}
      <div className="h-[1px] bg-neutral-100 mx-4" />

      {/* Delete Button */}
      <button
        onClick={onDelete}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-red-500 group cursor-pointer"
      >
        <IconTrash size={20} stroke={2} />
        <span className="font-semibold text-base">Hapus Akun</span>
      </button>
    </div>
  );
}
