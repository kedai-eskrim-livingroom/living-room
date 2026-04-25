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
import dynamic from "next/dynamic";
import DateRangeModal from "@/components/DateRangeModal";
import StatCard from "@/components/StatCard";
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });
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



function GrowthChart({ data }) {
  if (!data || data.length === 0) return null;

  // Siapkan data untuk ApexCharts
  const series = [{
    name: "Pendapatan",
    data: data.map(d => d.revenue) // Ambil nilai angkanya saja
  }];

  const options = {
    chart: {
      type: 'area',
      fontFamily: 'inherit',
      toolbar: { show: false }, // Hilangkan menu hamburger bawaan apexcharts
      zoom: { enabled: false }
    },
    colors: ['#FF6900'], // Warna garis oranye
    fill: {
      colors: ['#FFD6A8'],
      opacity: 0.5,
      type: 'solid'
    },
    dataLabels: {
      enabled: false // Matikan angka di titik grafik
    },
    stroke: {
      curve: 'smooth', // Efek melengkung halus seperti di desain
      width: 2.5
    },
    grid: {
      borderColor: '#FAFAFA',     // Efek putus-putus
      xaxis: { lines: { show: false } }, // Hilangkan garis vertikal
      yaxis: { lines: { show: true } },  // Tampilkan garis horizontal
      padding: { top: 0, right: 0, bottom: 0, left: 10 }
    },
    xaxis: {
      categories: data.map(d => d.day), // Label hari (Sen, Rab, Jum, dll)
      axisBorder: { show: false },      // Hilangkan garis bawah tebal
      axisTicks: { show: false },
      labels: {
        style: { colors: '#737373', fontSize: '11px' }
      }
    },
    yaxis: {
      labels: {
        style: { colors: '#737373', fontSize: '11px' },
        formatter: (value) => {
          // Format angka jadi "k" (contoh: 1250000 -> 1.250k)
          if (value >= 1000) {
            return (value / 1000).toLocaleString('id-ID') + 'k';
          }
          return value.toLocaleString('id-ID');
        }
      }
    },
    tooltip: {
      y: {
        formatter: (val) => `Rp ${val.toLocaleString('id-ID')}`
      }
    }
  };

  return (
    <div className="w-full mt-2 relative z-0">
      <ReactApexChart
        options={options}
        series={series}
        type="area"
        height={250}
      />
    </div>
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

function Skeleton() {
  return (
    <div className="flex flex-col gap-4">
      {/* Stat Card Skeletons */}
      {[1, 2, 3].map(i => (
        <div key={i} className="flex items-stretch rounded-2xl overflow-hidden border border-orange-100 animate-pulse min-h-[88px]">
          {/* Icon placeholder */}
          <div className="w-20 bg-orange-100 flex items-center justify-center shrink-0">
            <div className="w-9 h-9 rounded-full bg-orange-200" />
          </div>
          {/* Text placeholder */}
          <div className="flex-1 bg-orange-50 px-4 py-4 flex flex-col justify-center gap-2">
            <div className="h-3 bg-orange-200 rounded w-1/2" />
            <div className="h-5 bg-orange-200 rounded w-3/4" />
          </div>
        </div>
      ))}
      {/* Chart placeholder (Top Selling) */}
      <div className="rounded-2xl border border-orange-100 bg-orange-50 animate-pulse p-4 mt-2">
        <div className="h-4 bg-orange-200 rounded w-1/3 mb-4" />
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="flex justify-between">
                <div className="h-3 bg-orange-200 rounded w-1/3" />
                <div className="h-3 bg-orange-200 rounded w-12" />
              </div>
              <div className="h-2.5 bg-orange-200 rounded-full w-full" />
            </div>
          ))}
        </div>
      </div>
      {/* Chart placeholder (Growth) */}
      <div className="rounded-2xl border border-orange-100 bg-orange-50 animate-pulse p-4">
        <div className="h-4 bg-orange-200 rounded w-1/3 mb-4" />
        <div className="h-48 bg-orange-100 rounded-xl" />
      </div>
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
    <div className="flex flex-col gap-6 max-w-2xl mx-auto pb-10">

        <h1 className="text-2xl font-bold text-neutral-900 mt-2">Dashboard</h1>

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
          <div>

            {/* Stat Cards dengan Ikon Tabler */}
            <div className="flex flex-col gap-4 mb-6">
              <StatCard
                icon={<IconReceipt size={28} stroke={2} />}
                label="Total Items Terjual"
                value={String(d.summary.totalItemsSold || 0)}
                from="from-orange-300/50" to="to-orange-100"
                borderColor="border-orange-500" labelColor="text-orange-500" textColor="text-orange-600" delay={0}
                iconBorderColor="border-orange-300"
              />
              <StatCard
                icon={<IconWallet size={28} stroke={2} />}
                label="Total Pendapatan"
                value={formatRupiah(d.summary.totalRevenue)}
                from="from-emerald-300/50" to="to-emerald-100"
                borderColor="border-emerald-500" labelColor="text-emerald-500" textColor="text-emerald-600" delay={60}
                iconBorderColor="border-emerald-300"
              />
              <StatCard
                icon={<IconChartBar size={28} stroke={2} />}
                label="Rata-Rata Pendapatan"
                value={formatRupiah(d.summary.averageRevenue)}
                from="from-sky-300/50" to="to-sky-100"
                borderColor="border-sky-500" labelColor="text-sky-500" textColor="text-sky-600" delay={60}
                iconBorderColor="border-sky-300"
              />
            </div>

            {/* Top Selling */}
            <div className="bg-orange-100 rounded-2xl border border-orange-500 p-4 mb-6">
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
            <div className="bg-orange-100 rounded-2xl border border-orange-500 p-4">
              <h2 className="font-bold text-neutral-900 text-lg tracking-tight mb-2">Growth Penjualan</h2>

              {growthData.length === 0 ? (
                <div className="py-10 text-center text-sm text-neutral-500 font-medium italic">
                  Belum ada data penjualan
                </div>
              ) : (
                <GrowthChart data={growthData} />
              )}
            </div>

          </div>
        )}
    </div>
  );
}