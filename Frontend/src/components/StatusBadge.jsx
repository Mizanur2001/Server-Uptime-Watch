export default function StatusBadge({ status }) {
    const s = (status || "").toUpperCase();

    const map = {
        UP: { label: "UP", className: "bg-emerald-500/10 text-emerald-300 border-emerald-500/40" },
        DOWN: { label: "DOWN", className: "bg-rose-500/10 text-rose-300 border-rose-500/40" },
        WARN: { label: "WARNING", className: "bg-amber-500/10 text-amber-300 border-amber-500/40" },
        UNKNOWN: { label: "UNKNOWN", className: "bg-slate-500/10 text-slate-300 border-slate-500/40" },
    };

    const cfg = map[s] || map.UNKNOWN;

    return (
        <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border ${cfg.className}`}
        >
            <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
            <span>{cfg.label}</span>
        </span>
    );
}