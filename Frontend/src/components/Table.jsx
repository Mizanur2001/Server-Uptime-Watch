export default function Table({ columns, data }) {
    return (
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80">
            {/* Desktop / tablet table */}
            <table className="min-w-full text-sm hidden md:table">
                <thead className="bg-slate-900">
                    <tr>
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className="px-4 py-2 text-left text-xs font-semibold text-slate-400 border-b border-slate-800"
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 && (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="px-4 py-4 text-center text-slate-500 text-sm"
                            >
                                No data
                            </td>
                        </tr>
                    )}
                    {data.map((row, idx) => (
                        <tr
                            key={idx}
                            className="border-b border-slate-800/80 hover:bg-slate-800/60 transition"
                        >
                            {columns.map((col) => (
                                <td key={col.key} className="px-4 py-2 text-slate-100">
                                    {col.render ? col.render(row) : row[col.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Mobile stacked rows */}
            <div className="md:hidden">
                {data.length === 0 && (
                    <div className="px-4 py-4 text-center text-slate-500 text-sm">No data</div>
                )}
                {data.map((row, idx) => (
                    <div
                        key={idx}
                        className="border-b border-slate-800/80 hover:bg-slate-800/60 transition px-4 py-3"
                    >
                        {columns.map((col) => {
                            const label =
                                typeof col.header === "string"
                                    ? col.header
                                    : (col.key || "").charAt(0).toUpperCase() + (col.key || "").slice(1);
                            const value = col.render ? col.render(row) : row[col.key];

                            return (
                                <div key={col.key} className="flex items-start justify-between gap-4 py-1">
                                    <div className="text-xs text-slate-400 w-1/3">{label}</div>
                                    <div className="text-sm text-slate-100 w-2/3 truncate">
                                        {value}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}
