export default function StatCard({ icon, label, value, from, to, borderColor, textColor, delay, iconBorderColor }) {
  return (
    <div className={`rounded-2xl p-4 flex items-center gap-2 border bg-linear-to-r ${from} ${to} ${borderColor}`} style={{ animation: `fadeUp 0.4s ease-out ${delay}ms both` }}>
      <div className={`w-14 h-14 bg-white rounded-lg border ${iconBorderColor} flex items-center justify-center shrink-0 ${textColor}`}>
        {icon}
      </div>
      <div>
        <p className={`text-[12px] font-medium ${textColor}`}>{label}</p>
        <p className={`font-extrabold text-2xl tracking-tight ${textColor}`}>{value}</p>
      </div>
    </div>
  );
}