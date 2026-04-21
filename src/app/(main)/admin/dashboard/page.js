"use client";

import { useState, useEffect } from "react";
import { getDashboard } from "@/utils/api/admin/dashboard";
import {
  IconCalendar,
  IconReceipt,
  IconWallet,
  IconChartBar,
  IconX,
  IconChevronLeft,
  IconChevronRight
} from "@tabler/icons-react";

// ─── Helpers ───────────────────────────────────────────────────────────────────
function formatRupiah(amount) {
  if (!amount && amount !== 0) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  })
    .format(amount)
    .replace("IDR\u00a0", "Rp");
}

function formatDateLabel(date) {
  if (!date) return "";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function toISO(date) {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ─── Mini Calendar & Modals ──────────────────────────────────────────────────
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function MiniCalendar({ year, month, rangeStart, rangeEnd, onSelect }) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold text-gray-400 py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const date = new Date(year, month, d);
          const isStart = rangeStart && toISO(rangeStart) === toISO(date);
          const isEnd = rangeEnd && toISO(rangeEnd) === toISO(date);
          const inRange = rangeStart && rangeEnd && date > rangeStart && date < rangeEnd;
          const active = isStart || isEnd;
          return (
            <button key={i} onClick={() => onSelect(date)}
              className={[
                "text-xs h-8 w-full rounded-lg transition-colors font-medium",
                active ? "bg-[#FF8C42] text-white font-bold shadow" : "",
                inRange && !active ? "bg-orange-100 text-orange-800" : "",
                !active && !inRange ? "hover:bg-orange-50 text-gray-700" : "",
              ].join(" ")}
            >{d}</button>
          );
        })}
      </div>
    </div>
  );
}

function DatePickerModal({ onClose, onSet }) {
  const today = new Date();
  const [viewYear1, setViewYear1] = useState(today.getFullYear());
  const [viewMonth1, setViewMonth1] = useState(today.getMonth());
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd, setRangeEnd] = useState(null);

  const viewYear2 = viewMonth1 === 11 ? viewYear1 + 1 : viewYear1;
  const viewMonth2 = viewMonth1 === 11 ? 0 : viewMonth1 + 1;

  const handleSelect = (date) => {
    if (!rangeStart || (rangeStart && rangeEnd)) { setRangeStart(date); setRangeEnd(null); }
    else {
      if (date < rangeStart) { setRangeEnd(rangeStart); setRangeStart(date); }
      else setRangeEnd(date);
    }
  };

  const prevMonth = () => { if (viewMonth1 === 0) { setViewMonth1(11); setViewYear1(viewYear1 - 1); } else setViewMonth1(viewMonth1 - 1); };
  const nextMonth = () => { if (viewMonth1 === 11) { setViewMonth1(0); setViewYear1(viewYear1 + 1); } else setViewMonth1(viewMonth1 + 1); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" style={{ animation: "slideUp 0.2s ease-out" }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900 text-lg">Pilih Tanggal</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <IconX size={20} stroke={2} />
          </button>
        </div>
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <button onClick={prevMonth} className="text-[#FF8C42] w-8 h-8 flex items-center justify-center rounded-lg hover:bg-orange-50 transition-colors">
              <IconChevronLeft size={20} stroke={2.5} />
            </button>
            <span className="font-semibold text-gray-800">{MONTHS[viewMonth1]} {viewYear1}</span>
            <button onClick={nextMonth} className="text-[#FF8C42] w-8 h-8 flex items-center justify-center rounded-lg hover:bg-orange-50 transition-colors">
              <IconChevronRight size={20} stroke={2.5} />
            </button>
          </div>
          <MiniCalendar year={viewYear1} month={viewMonth1} rangeStart={rangeStart} rangeEnd={rangeEnd} onSelect={handleSelect} />
        </div>
        <div className="mb-6">
          <div className="flex items-center justify-center mb-3">
            <span className="font-semibold text-gray-800">{MONTHS[viewMonth2]} {viewYear2}</span>
          </div>
          <MiniCalendar year={viewYear2} month={viewMonth2} rangeStart={rangeStart} rangeEnd={rangeEnd} onSelect={handleSelect} />
        </div>
        <button
          onClick={() => { if (rangeStart) onSet(rangeStart, rangeEnd); }}
          disabled={!rangeStart}
          className="w-full bg-[#FF8C42] hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors"
        >Set Tanggal</button>
      </div>
    </div>
  );
}

// ─── Growth Chart (Dinamis) ────────────────────────────────────────────────────
function GrowthChart({ data }) {
  console.log(data, "chart");

  if (!data || data.length === 0) return null;

  const max = Math.max(...data.map((d) => d.revenue));
  const min = Math.min(...data.map((d) => d.revenue));
  const range = max - min || 1;
  const W = 560, H = 140, PAD_X = 20, PAD_Y = 20;
  const length = data.length != 1 ? data.length : 1;

  const pts = data.map((d, i) => ({
    x: PAD_X + i * ((W - PAD_X * 2) / (length)),
    y: PAD_Y + (1 - (d.revenue - min) / range) * (H - PAD_Y * 2),
  }));

  console.log(pts, "pts");
  const smooth = pts.map((p, i) => {
    if (i === 0) return `M${p.x},${p.y}`;
    const prev = pts[i - 1];
    const cpx = (prev.x + p.x) / 2;
    return `C${cpx},${prev.y} ${cpx},${p.y} ${p.x},${p.y}`;
  }).join(" ");

  const areaSmooth = smooth + ` L${pts[pts.length - 1].x},${H} L${pts[0].x},${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H + 24}`} className="w-full mt-2" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF8C42" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#FF8C42" stopOpacity="0.0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((r, i) => (
        <line key={i} x1={PAD_X} y1={PAD_Y + r * (H - PAD_Y * 2)} x2={W - PAD_X} y2={PAD_Y + r * (H - PAD_Y * 2)} stroke="#FFDCC2" strokeWidth="0.5" strokeDasharray="4 4" />
      ))}
      <path d={areaSmooth} fill="url(#cg)" />
      <path d={smooth} fill="none" stroke="#FF8C42" strokeWidth="2.5" strokeLinecap="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="5" fill="white" stroke="#FF8C42" strokeWidth="2.5" />
          <circle cx={p.x} cy={p.y} r="2" fill="#FF8C42" />
        </g>
      ))}
      {data.map((d, i) => (
        <text key={i} x={pts[i].x} y={H + 20} textAnchor="middle" fontSize="11" fill="#A89A8E" fontFamily="Inter,sans-serif">{d.day}</text>
      ))}
    </svg>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, bg, borderColor, textColor, delay }) {
  return (
    <div className={`rounded-xl p-4 flex items-center gap-4 border shadow-sm ${bg} ${borderColor}`} style={{ animation: `fadeUp 0.4s ease-out ${delay}ms both` }}>
      <div className={`w-14 h-14 bg-white/60 backdrop-blur-sm rounded-xl border border-white/60 flex items-center justify-center shrink-0 shadow-sm ${textColor}`}>
        {icon}
      </div>
      <div>
        <p className={`text-[13px] font-semibold mb-0.5 ${textColor}`}>{label}</p>
        <p className={`font-extrabold text-2xl tracking-tight ${textColor}`}>{value}</p>
      </div>
    </div>
  );
}

// ─── Top Selling Row ───────────────────────────────────────────────────────────
function TopSellingRow({ name, items, maxItems }) {
  const pct = maxItems > 0 ? Math.round((items / maxItems) * 100) : 0;
  return (
    <div className="py-2.5">
      <div className="flex justify-between items-center mb-1.5">
        <p className="text-gray-900 text-sm font-bold truncate">{name}</p>
        <span className="text-gray-600 text-[13px] font-medium shrink-0">{items} items</span>
      </div>
      <div className="h-2.5 bg-white rounded-full overflow-hidden border border-[#FFDCC2]">
        <div className="h-full bg-[#FF8C42] rounded-full" style={{ width: `${pct}%`, transition: "width 0.8s ease-out" }} />
      </div>
    </div>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-2xl bg-gray-100 border border-gray-200 animate-pulse" />)}
      <div className="h-56 rounded-2xl bg-gray-100 border border-gray-200 animate-pulse mt-2" />
      <div className="h-56 rounded-2xl bg-gray-100 border border-gray-200 animate-pulse" />
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
const PERIODS = ["Minggu", "1 Bulan", "3 Bulan", "6 Bulan"];

export default function Dashboard() {
  const [activePeriod, setActivePeriod] = useState("Minggu");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async (startDate, endDate) => {
    setLoading(true);
    try {
      const res = await getDashboard(startDate, endDate);
      setDashData(res?.data || res || { totalItemsTerjual: 0, totalPendapatan: 0, rataRata: 0, topSelling: [], growth: [] });
    } catch {
      setDashData({ totalItemsTerjual: 0, totalPendapatan: 0, rataRata: 0, topSelling: [], growth: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const today = new Date();
    let start = new Date(today);
    if (activePeriod === "Minggu") start.setDate(today.getDate() - 7);
    else if (activePeriod === "1 Bulan") start.setMonth(today.getMonth() - 1);
    else if (activePeriod === "3 Bulan") start.setMonth(today.getMonth() - 3);
    else if (activePeriod === "6 Bulan") start.setMonth(today.getMonth() - 6);
    fetchData(toISO(start), toISO(today));
    setDateRange({ start: null, end: null });
  }, [activePeriod]);

  const handleDateSet = (start, end) => {
    setDateRange({ start, end });
    setShowDatePicker(false);
    fetchData(start ? toISO(start) : undefined, end ? toISO(end) : undefined);
  };

  const d = dashData || {};
  const topSelling = d.topSelling || d.topSellingData || [];
  const growthData = d.salesGrowth || d.growthData || [];
  const maxItems = Math.max(...topSelling.map((x) => x.sold || x.totalItems || 0), 1);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { font-family: 'Inter', sans-serif; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <main className="w-full bg-white min-h-screen p-4 md:p-8">
        <div className="max-w-xl mx-auto">

          <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Dashboard</h1>

          {/* Period Buttons */}
          <div className="flex gap-2 mb-5 flex-wrap">
            {PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setActivePeriod(p)}
                className={[
                  "px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm border",
                  activePeriod === p
                    ? "bg-[#FF8C42] text-white border-[#FF8C42]"
                    : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50",
                ].join(" ")}
              >{p}</button>
            ))}
          </div>

          {/* Date Input */}
          <button
            onClick={() => setShowDatePicker(true)}
            className="flex items-center gap-3 w-full px-4 py-3.5 bg-white border-2 border-gray-100 rounded-xl text-sm text-gray-400 hover:border-orange-200 hover:text-orange-400 transition-colors mb-8 text-left font-medium shadow-sm"
          >
            <span className="text-gray-400"><IconCalendar size={20} stroke={2} /></span>
            {dateRange.start
              ? `${formatDateLabel(dateRange.start)}${dateRange.end ? " – " + formatDateLabel(dateRange.end) : ""}`
              : "Pilih tanggal"}
          </button>

          {loading ? <Skeleton /> : (
            <div style={{ animation: "fadeUp 0.35s ease-out" }}>

              {/* Stat Cards dengan Ikon Tabler */}
              <div className="flex flex-col gap-3 mb-8">
                <StatCard
                  icon={<IconReceipt size={28} stroke={1.5} />}
                  label="Total Items Terjual"
                  value={String(d.summary.totalItemsSold || 0)}
                  bg="bg-[#FFF4E8]" borderColor="border-[#FFDCC2]" textColor="text-[#E65C00]" delay={0}
                />
                <StatCard
                  icon={<IconWallet size={28} stroke={1.5} />}
                  label="Total Pendapatan"
                  value={formatRupiah(d.summary.totalRevenue)}
                  bg="bg-[#E6F8ED]" borderColor="border-[#A1DFBD]" textColor="text-[#0D8C4F]" delay={60}
                />
                <StatCard
                  icon={<IconChartBar size={28} stroke={1.5} />}
                  label="Rata-Rata Pendapatan"
                  value={formatRupiah(d.summary.averageRevenue)}
                  bg="bg-[#E5F3FF]" borderColor="border-[#A6D0FF]" textColor="text-[#005BBA]" delay={120}
                />
              </div>

              {/* Top Selling */}
              <div className="bg-[#FFF9F2] rounded-2xl border border-[#FFDCC2] shadow-sm p-5 mb-6" style={{ animation: "fadeUp 0.4s ease-out 180ms both" }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-extrabold text-gray-900 text-lg tracking-tight">Top Selling</h2>
                </div>

                {topSelling.length === 0 ? (
                  <div className="py-6 text-center text-sm text-gray-500 font-medium italic">
                    Belum ada data penjualan
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    {topSelling.map((item, i) => (
                      <TopSellingRow key={i}
                        name={item.name || item.menuName || "Nama menu"}
                        items={item.sold || item.totalItems || item.qty || 0}
                        maxItems={maxItems}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Growth Chart */}
              <div className="bg-[#FFF9F2] rounded-2xl border border-[#FFDCC2] shadow-sm p-5" style={{ animation: "fadeUp 0.4s ease-out 240ms both" }}>
                <h2 className="font-extrabold text-gray-900 text-lg tracking-tight mb-2">Growth Penjualan</h2>

                {growthData.length === 0 ? (
                  <div className="py-10 text-center text-sm text-gray-500 font-medium italic">
                    Belum ada data penjualan
                  </div>
                ) : (
                  <GrowthChart data={growthData} />
                )}
              </div>

            </div>
          )}
        </div>
      </main>

      {showDatePicker && (
        <DatePickerModal onClose={() => setShowDatePicker(false)} onSet={handleDateSet} />
      )}
    </>
  );
}