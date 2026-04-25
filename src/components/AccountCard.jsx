"use client";

import { useState, useRef, useEffect } from "react";
import { IconDotsVertical } from "@tabler/icons-react";
import DropdownMenu from "./ui/dropdownMenu";

export default function AccountCard({ 
  index, 
  email,
  onEdit,
  onDelete
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-center justify-between p-3 bg-white border border-neutral-200 rounded-xl hover:border-orange-300 transition-all group relative">
      <div className="flex items-center gap-4">
        
        {/* Index/Initial Box */}
        <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg shrink-0">
          <span className="font-bold text-black text-lg">
            {index}
          </span>
        </div>

        {/* Account Info */}
        <div className="flex flex-col">
          <span className="font-medium text-neutral-800 text-base">
            {email}
          </span>
        </div>

      </div>

      {/* Action Icon & Dropdown */}
      <div className="relative" ref={menuRef}>
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-500"
        >
          <IconDotsVertical size={20} />
        </button>

        {isMenuOpen && (
          <DropdownMenu 
            onEdit={() => {
              onEdit?.();
              setIsMenuOpen(false);
            }} 
            onDelete={() => {
              onDelete?.();
              setIsMenuOpen(false);
            }} 
          />
        )}
      </div>
    </div>
  );
}
