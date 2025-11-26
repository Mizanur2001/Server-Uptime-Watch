export default function Table({ columns, data }) {
    return (
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80">
            <table className="min-w-full text-sm">
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
        </div>
    );
}
