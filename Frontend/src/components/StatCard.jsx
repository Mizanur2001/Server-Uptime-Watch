export default function StatCard({ label, value, sublabel }) {
    return (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 shadow-sm">
            <p className="text-xs text-slate-400 uppercase tracking-wide">{label}</p>
            <div className="mt-1 flex items-end gap-2">
                <p className="text-2xl font-semibold text-slate-50">{value}</p>
                {sublabel && (
                    <p className="text-xs text-slate-500">{sublabel}</p>
                )}
            </div>
        </div>
    );
}
