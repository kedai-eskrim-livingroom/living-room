"use client";

import { useState, useEffect } from "react";
import { getDashboard } from "@/services/api/admin/dashboard";
import {
  IconCalendarWeek,
  IconReceipt,
  IconWallet,
  IconChartBar,
  IconX,
  IconChevronLeft,
  IconChevronRight
} from "@tabler/icons-react";
import DateRangeModal from "@/components/DateRangeModal";
import StatCard from "@/components/StatCard";

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


// ─── Top Selling Row ───────────────────────────────────────────────────────────
function TopSellingRow({ name, items, maxItems }) {
  const pct = maxItems > 0 ? Math.round((items / maxItems) * 100) : 0;
  return (
    <div className="py-2.5">
      <div className="flex justify-between items-center mb-1.5">
        <p className="text-neutral-950 text-sm font-semibold truncate">{name}</p>
        <span className="text-neutral-950 text-sm shrink-0">{items} items</span>
      </div>
      <div className="h-2.5 bg-white rounded-full overflow-hidden">
        <div className="h-full bg-orange-500 rounded-full" style={{ width: `${pct}%`, transition: "width 0.8s ease-out" }} />
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

  const handleDateSet = async (startStr, endStr) => {
    setDateRange({
      start: startStr ? new Date(startStr) : null,
      end: endStr ? new Date(endStr) : null
    });
    await fetchData(startStr, endStr);
  };

  const d = dashData || {};
  const topSelling = d.topSelling || d.topSellingData || [];
  const growthData = d.salesGrowth || d.growthData || [];
  const maxItems = Math.max(...topSelling.map((x) => x.sold || x.totalItems || 0), 1);

  return (
    <>
      <div className="flex flex-col gap-6 max-w-2xl mx-auto pb-10">

        <h1 className="text-2xl font-extrabold text-black mt-2">Dashboard</h1>

        {/* Period Buttons */}
        <div className="flex gap-2">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setActivePeriod(p)}
              className={[
                "flex-1 py-2 rounded-lg text-sm font-semibold border",
                activePeriod === p
                  ? "bg-orange-500 text-white"
                  : "bg-neutral-100 text-neutral-500",
              ].join(" ")}
            >{p}</button>
          ))}
        </div>

        {/* Date Input */}
        <DateRangeModal
          title="Pilih Rentang Tanggal"
          actionLabel="Tampilkan Data"
          onAction={handleDateSet}
          triggerNode={
            <button
              className="flex items-center gap-2 w-full px-4 py-2 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-400 transition-colors text-left font-medium hover:border-orange-500"
            >
              <span className="text-neutral-400"><IconCalendarWeek size={20} stroke={2} /></span>
              {dateRange.start
                ? `${formatDateLabel(dateRange.start)}${dateRange.end ? " – " + formatDateLabel(dateRange.end) : ""}`
                : "Pilih tanggal kustom"}
            </button>
          }
        />

        {loading ? <Skeleton /> : (
          <div style={{ animation: "fadeUp 0.35s ease-out" }}>

            {/* Stat Cards dengan Ikon Tabler */}
            <div className="flex flex-col gap-4 mb-6">
              <StatCard
                icon={<IconReceipt size={28} stroke={2} />}
                label="Total Items Terjual"
                value={String(d.summary.totalItemsSold || 0)}
                bg="orange"
                from="from-orange-300/50" to="to-orange-100"
                borderColor="border-[#FF6900]" textColor="text-[#F54A00]" delay={0}
                iconBorderColor="border-[#FFB86A]"
              />
              <StatCard
                icon={<IconWallet size={28} stroke={2} />}
                label="Total Pendapatan"
                value={formatRupiah(d.summary.totalRevenue)}
                bg="emerald"
                from="from-emerald-300/50" to="to-emerald-100"
                borderColor="border-[#00BC7D]" textColor="text-[#009966]" delay={60}
                iconBorderColor="border-[#5EE9B5]"
              />
              <StatCard
                icon={<IconChartBar size={28} stroke={2} />}
                label="Rata-Rata Pendapatan"
                value={formatRupiah(d.summary.averageRevenue)}
                bg="sky"
                from="from-sky-300/50" to="to-sky-100"
                borderColor="border-[#00A6F4]" textColor="text-[#0084D1]" delay={120}
                iconBorderColor="border-[#74D4FF]"
              />
            </div>

            {/* Top Selling */}
            <div className="bg-orange-100 rounded-2xl border border-orange-500 p-4 mb-6" style={{ animation: "fadeUp 0.4s ease-out 180ms both" }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-extrabold text-neutral-950 text-lg tracking-tight">Top Selling</h2>
              </div>

              {topSelling.length === 0 ? (
                <div className="py-6 text-center text-sm text-neutral-500 font-medium italic">
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
            <div className="bg-orange-100 rounded-2xl border border-orange-500 p-4" style={{ animation: "fadeUp 0.4s ease-out 240ms both" }}>
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


    </>
  );
}