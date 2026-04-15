"use client";

import { useState, useEffect } from "react";
import { getDashboard } from "@/utils/api/admin/dashboard";

// ─── Helpers ───────────────────────────────────────────────────────────────────
function formatRupiah(amount) {
  if (!amount && amount !== 0) return "Rpxxx.xxx";
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

// ─── Demo / Fallback data ──────────────────────────────────────────────────────
const DEMO = {
  totalItemsTerjual: 365,
  totalPendapatan: null,
  rataRata: null,
  topSelling: [
    { name: "Nama menu", items: 370 },
    { name: "Nama menu", items: 145 },
    { name: "Nama menu", items: 79 },
    { name: "Nama menu", items: 35 },
  ],
  growth: [
    { label: "Sen", value: 120000 },
    { label: "Sel", value: 180000 },
    { label: "Rab", value: 145000 },
    { label: "Kam", value: 210000 },
    { label: "Jum", value: 175000 },
    { label: "Sab", value: 260000 },
    { label: "Min", value: 195000 },
  ],
};

// ─── Mini Calendar ─────────────────────────────────────────────────────────────
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
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
          const isEnd   = rangeEnd   && toISO(rangeEnd)   === toISO(date);
          const inRange = rangeStart && rangeEnd && date > rangeStart && date < rangeEnd;
          const active  = isStart || isEnd;
          return (
            <button key={i} onClick={() => onSelect(date)}
              className={[
                "text-xs h-8 w-full rounded-lg transition-colors font-medium",
                active              ? "bg-[#FF8C42] text-white font-bold shadow" : "",
                inRange && !active  ? "bg-orange-100 text-orange-800"            : "",
                !active && !inRange ? "hover:bg-orange-50 text-gray-700"         : "",
              ].join(" ")}
            >{d}</button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Date Picker Modal ─────────────────────────────────────────────────────────
function DatePickerModal({ onClose, onSet }) {
  const today = new Date();
  const [viewYear1, setViewYear1]   = useState(today.getFullYear());
  const [viewMonth1, setViewMonth1] = useState(today.getMonth());
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd,   setRangeEnd]   = useState(null);

  const viewYear2  = viewMonth1 === 11 ? viewYear1 + 1 : viewYear1;
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
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">×</button>
        </div>
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <button onClick={prevMonth} className="text-[#FF8C42] w-8 h-8 flex items-center justify-center rounded-lg hover:bg-orange-50 transition-colors font-bold text-lg">‹</button>
            <span className="font-semibold text-gray-800">{MONTHS[viewMonth1]} {viewYear1}</span>
            <button onClick={nextMonth} className="text-[#FF8C42] w-8 h-8 flex items-center justify-center rounded-lg hover:bg-orange-50 transition-colors font-bold text-lg">›</button>
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

// ─── Growth Chart ──────────────────────────────────────────────────────────────
function GrowthChart({ data }) {
  const chartData = data && data.length > 0 ? data : DEMO.growth;
  const max = Math.max(...chartData.map((d) => d.value));
  const min = Math.min(...chartData.map((d) => d.value));
  const range = max - min || 1;
  const W = 560, H = 120, PAD_X = 20, PAD_Y = 12;

  const pts = chartData.map((d, i) => ({
    x: PAD_X + i * ((W - PAD_X * 2) / (chartData.length - 1)),
    y: PAD_Y + (1 - (d.value - min) / range) * (H - PAD_Y * 2),
  }));

  const smooth = pts.map((p, i) => {
    if (i === 0) return `M${p.x},${p.y}`;
    const prev = pts[i - 1];
    const cpx = (prev.x + p.x) / 2;
    return `C${cpx},${prev.y} ${cpx},${p.y} ${p.x},${p.y}`;
  }).join(" ");

  const areaSmooth = smooth + ` L${pts[pts.length-1].x},${H} L${pts[0].x},${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H + 24}`} className="w-full" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#FF8C42" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#FF8C42" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((r, i) => (
        <line key={i} x1={PAD_X} y1={PAD_Y + r*(H-PAD_Y*2)} x2={W-PAD_X} y2={PAD_Y + r*(H-PAD_Y*2)} stroke="#f3f4f6" strokeWidth="1" />
      ))}
      <path d={areaSmooth} fill="url(#cg)" />
      <path d={smooth} fill="none" stroke="#FF8C42" strokeWidth="2.5" strokeLinecap="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="5" fill="white" stroke="#FF8C42" strokeWidth="2.5" />
          <circle cx={p.x} cy={p.y} r="2" fill="#FF8C42" />
        </g>
      ))}
      {chartData.map((d, i) => (
        <text key={i} x={pts[i].x} y={H+20} textAnchor="middle" fontSize="11" fill="#9ca3af" fontFamily="Inter,sans-serif">{d.label}</text>
      ))}
    </svg>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, bg, delay }) {
  return (
    <div className="rounded-2xl p-5 flex items-center gap-4 shadow-sm" style={{ background: bg, animation: `fadeUp 0.4s ease-out ${delay}ms both` }}>
      <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl shrink-0">{icon}</div>
      <div>
        <p className="text-white/80 text-xs font-semibold uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-white font-bold text-2xl">{value}</p>
      </div>
    </div>
  );
}

// ─── Top Selling Row ───────────────────────────────────────────────────────────
function TopSellingRow({ rank, name, items, maxItems }) {
  const pct = maxItems > 0 ? Math.round((items / maxItems) * 100) : 0;
  return (
    <div className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
      <span className="text-gray-400 text-sm font-semibold w-5 text-center shrink-0">{rank}</span>
      <div className="flex-1 min-w-0">
        <p className="text-gray-800 text-sm font-semibold truncate mb-1.5">{name}</p>
        <div className="h-2 bg-orange-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#FF8C42] rounded-full" style={{ width: `${pct}%`, transition: "width 0.8s ease-out" }} />
        </div>
      </div>
      <span className="text-gray-400 text-xs shrink-0 font-medium">{items} Items</span>
    </div>
  );
}

// ─── Icons ─────────────────────────────────────────────────────────────────────
const IconCalendar = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2"/><path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18"/></svg>;

// ─── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[1,2,3].map(i => <div key={i} className="h-20 rounded-2xl bg-gray-100 animate-pulse"/>)}
      <div className="h-56 rounded-2xl bg-gray-100 animate-pulse mt-1"/>
      <div className="h-56 rounded-2xl bg-gray-100 animate-pulse"/>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
const PERIODS = ["Minggu", "1 Bulan", "3 Bulan", "6 Bulan"];

export default function Dashboard() {
  const [activePeriod,   setActivePeriod]   = useState("Minggu");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange,      setDateRange]      = useState({ start: null, end: null });
  const [dashData,       setDashData]       = useState(null);
  const [loading,        setLoading]        = useState(true);

  const fetchData = async (startDate, endDate) => {
    setLoading(true);
    try {
      const res = await getDashboard(startDate, endDate);
      setDashData(res?.data || res || DEMO);
    } catch {
      setDashData(DEMO);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const today = new Date();
    let start = new Date(today);
    if      (activePeriod === "Minggu")   start.setDate(today.getDate() - 7);
    else if (activePeriod === "1 Bulan")  start.setMonth(today.getMonth() - 1);
    else if (activePeriod === "3 Bulan")  start.setMonth(today.getMonth() - 3);
    else if (activePeriod === "6 Bulan")  start.setMonth(today.getMonth() - 6);
    fetchData(toISO(start), toISO(today));
    setDateRange({ start: null, end: null });
  }, [activePeriod]);

  const handleDateSet = (start, end) => {
    setDateRange({ start, end });
    setShowDatePicker(false);
    fetchData(start ? toISO(start) : undefined, end ? toISO(end) : undefined);
  };

  const d          = dashData || DEMO;
  const topSelling = d.topSelling || DEMO.topSelling;
  const maxItems   = Math.max(...topSelling.map((x) => x.items || x.totalItems || 0), 1);

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

      {/* Menghilangkan wrapper div "flex min-h-screen" dan komponen <Sidebar /> 
        agar halaman ini menyatu sempurna dengan layout bawaan kamu. 
      */}
      <main className="w-full bg-gray-50 min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-7">Dashboard</h1>

          {/* Period Buttons */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setActivePeriod(p)}
                className={[
                  "px-5 py-2 rounded-full text-sm font-semibold transition-all",
                  activePeriod === p
                    ? "bg-[#FF8C42] text-white shadow-md"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-orange-300 hover:text-orange-500",
                ].join(" ")}
              >{p}</button>
            ))}
          </div>

          {/* Date Input */}
          <button
            onClick={() => setShowDatePicker(true)}
            className="flex items-center gap-2 w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-400 hover:border-orange-300 hover:text-orange-400 transition-colors mb-7 text-left"
          >
            <span className="text-[#FF8C42]"><IconCalendar /></span>
            {dateRange.start
              ? `${formatDateLabel(dateRange.start)}${dateRange.end ? " – " + formatDateLabel(dateRange.end) : ""}`
              : "Pilih tanggal"}
          </button>

          {loading ? <Skeleton /> : (
            <div style={{ animation: "fadeUp 0.35s ease-out" }}>

              {/* Stat Cards */}
              <div className="flex flex-col gap-4 mb-6">
                <StatCard icon="🛍️" label="Total Items Terjual"  value={String(d.totalItemsTerjual ?? DEMO.totalItemsTerjual)} bg="linear-gradient(135deg,#FF8C42,#FF5500)" delay={0}   />
                <StatCard icon="💰" label="Total Pendapatan"     value={formatRupiah(d.totalPendapatan)}   bg="linear-gradient(135deg,#2ECC85,#1A9E5F)" delay={60}  />
                <StatCard icon="📊" label="Rata-Rata Pendapatan" value={formatRupiah(d.rataRata)}          bg="linear-gradient(135deg,#4B9EE8,#2B6FBF)" delay={120} />
              </div>

              {/* Top Selling */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5" style={{ animation: "fadeUp 0.4s ease-out 180ms both" }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-900 text-base">Top Selling</h2>
                  <span className="text-sm text-[#FF8C42] font-medium cursor-pointer hover:underline">Lihat semua →</span>
                </div>
                {topSelling.map((item, i) => (
                  <TopSellingRow key={i} rank={i+1}
                    name={item.name || item.menuName || "Nama menu"}
                    items={item.items || item.totalItems || item.qty || 0}
                    maxItems={maxItems}
                  />
                ))}
              </div>

              {/* Growth Chart */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6" style={{ animation: "fadeUp 0.4s ease-out 240ms both" }}>
                <h2 className="font-bold text-gray-900 text-base mb-5">Growth Penjualan</h2>
                <GrowthChart data={d.growth || d.growthData} />
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