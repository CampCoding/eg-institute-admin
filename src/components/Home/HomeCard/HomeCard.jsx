export default function HomeCard({ children, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white/80 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}
