export default function HomeCardHeader({ title, subtitle, icon: Icon }) {
  return (
    <div className="flex items-center gap-3 px-6 pt-5 pb-3">
      <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center">
        <Icon className="h-5 w-5 text-slate-700" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}
