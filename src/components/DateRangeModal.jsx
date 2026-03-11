"use client";

import { useState } from "react";
import { format } from "date-fns";
import { IconX, IconDownload, IconLoader2 } from "@tabler/icons-react"; 
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";

export default function DateRangeModal({ 
  title, 
  actionLabel, 
  onAction, 
  triggerNode, 
  isExport = false 
}) {
  const [date, setDate] = useState({ from: undefined, to: undefined });
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleActionClick = async () => {
    try {
      setIsLoading(true);
      const startStr = date.from ? format(date.from, "yyyy-MM-dd") : null;
      const endStr = date.to ? format(date.to, "yyyy-MM-dd") : null;

      await onAction(startStr, endStr);
      setIsOpen(false); 
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{triggerNode}</DialogTrigger>
      
      {/* PERUBAHAN UNTUK RESPONSIVE (HP vs DESKTOP):
        - Default (HP): w-screen h-[100dvh] !rounded-none (Full screen)
        - md: (Desktop): md:w-fit md:h-auto md:!rounded-3xl (Modal melayang di tengah)
      */}
      <DialogContent className="!max-w-none w-screen h-[100dvh] md:w-fit md:h-auto flex flex-col p-0 bg-white !rounded-none md:!rounded-3xl !border-none overflow-hidden [&>button]:hidden shadow-2xl">
        
        {/* Header Modal */}
        <DialogHeader className="flex flex-row items-center justify-between px-6 py-6 shrink-0 md:pb-4">
          <DialogTitle className="text-2xl font-bold text-gray-900">{title}</DialogTitle>
          <DialogClose asChild>
            <button className="p-2 bg-transparent hover:bg-gray-100 rounded-full transition-colors">
              <IconX className="w-6 h-6 text-black" stroke={2} />
            </button>
          </DialogClose>
        </DialogHeader>

        {/* Area Kalender */}
        <div className="flex-1 overflow-y-auto px-6 no-scrollbar pb-6 md:pb-0">
          <div className="bg-[#FFF5EC] border border-[#FF7A00] rounded-3xl flex justify-center w-full">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2} 
              className="w-full flex justify-center rounded-3xl bg-orange-100 relative"
              classNames={{
                // Di HP flex-col (atas bawah), di Desktop flex-row (kiri kanan berdampingan)
                months: "flex flex-col md:flex-row space-y-4 md:space-x-8 md:space-y-0 w-full justify-center",
                month: "space-y-4 w-full md:w-auto",
                
                caption: "flex justify-center pt-1 relative items-center mb-4",
                caption_label: "text-base font-bold text-gray-900",
                nav: "rounded-md flex items-center justify-between w-full absolute top-2 left-0 px-2",
               button_next: "h-9 w-9 bg-white rounded-[10px] border border-gray-200 hover:border-[#FFCA99] hover:bg-orange-50 flex items-center justify-center transition-colors shadow-sm z-10",
               button_previous: "h-9 w-9 bg-white rounded-[10px] border border-gray-200 hover:border-[#FFCA99] hover:bg-orange-50 flex items-center justify-center transition-colors shadow-sm z-10",
                table: "w-full border-collapse space-y-1",
                head_row: "flex w-full justify-between",
                head_cell: "text-gray-500 font-normal text-xs w-9",
                row: "flex w-full mt-2 justify-between",
                
                // Ukuran hari sedikit dibesarkan di desktop (w-10 h-10)
                cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-[#FFCA99]! first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 w-9 h-9 md:w-10 md:h-10",
                day: "h-9 w-9 md:w-10 md:h-10 p-0 font-medium text-gray-700 rounded-[10px] hover:!bg-[#FFCA99] hover:!text-white transition-colors [&>button]:!bg-transparent [&>button]:!text-inherit [&>button]:!w-full [&>button]:!h-full [&>button]:!shadow-none rounded-md",
                
                selected: "bg-orange-500 text-white hover:bg-orange-500 hover:text-white focus:bg-orange-500 focus:text-white font-bold rounded-md",
                range_middle: "aria-selected:bg-orange-200 aria-selected:text-gray-900 aria-selected:rounded-none",
                range_start: " bg-orange-500 aria-selected:bg-orange-500 text-white rounded-md rounded-r-none font-bold",
                range_end: "day-range-end bg-orange-500 aria-selected:bg-orange-500 text-white rounded-md rounded-l-none font-bold",
                day_hidden: "invisible",
              }}
            />
          </div>
        </div>

        {/* Footer Tombol */}
        <div className="px-6 pb-8 pt-4 md:py-6 bg-white mt-auto shrink-0 border-t border-gray-50">
          <Button 
            onClick={handleActionClick}
            disabled={isLoading || !date?.from} 
            className="w-full bg-[#FF7A00] hover:bg-[#E56E00] text-white py-7 md:py-6 rounded-xl font-bold text-base shadow-sm"
          >
            {isLoading ? <IconLoader2 className="w-5 h-5 mr-2 animate-spin" stroke={2} /> : isExport ? <IconDownload className="w-5 h-5 mr-2" stroke={2} /> : null}
            {actionLabel}
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}