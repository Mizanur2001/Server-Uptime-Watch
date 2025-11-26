import { useEffect, useState } from "react";
import Table from "../components/Table.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import AddServerModal from "../components/AddServerModal.jsx";
import { io } from "socket.io-client";

// Connect socket
const socket = io(process.env.REACT_APP_API_URL);

// Convert date → “time ago”
const timeAgo = (date) => {
    if (!date) return "-";
    const now = new Date();
    const diff = Math.floor((now - new Date(date)) / 1000); // seconds

    if (diff < 5) return "just now";
    if (diff < 60) return `${diff}s ago`;

    const min = Math.floor(diff / 60);
    if (min < 60) return `${min}m ago`;

    const hrs = Math.floor(min / 60);
    if (hrs < 24) return `${hrs}h ago`;

    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
};

export default function Servers() {
    const [servers, setServers] = useState([]);
    const [openAdd, setOpenAdd] = useState(false);

    // Parse "3.82 GB" → 3.82
    const parseGB = (value) => {
        if (!value) return 0;
        return parseFloat(String(value).replace("GB", "").trim());
    };

    // Map backend → frontend format
    const mapServerData = (data) => {
        return data.map((s) => {
            const memUsed = parseGB(s.memUsed);
            const memTotal = parseGB(s.memTotal);
            const diskUsed = parseGB(s.diskUsed);
            const diskTotal = parseGB(s.diskTotal);

            return {
                id: s._id || s.id || "N/A",
                name: s.name,
                ip: s.ip,
                status: s.status,
                cpu: s.cpu ?? 0,

                // Memory data
                memUsed,
                memTotal,
                memPercent:
                    memTotal > 0 ? ((memUsed / memTotal) * 100).toFixed(1) : "-",

                // Disk data
                diskUsed,
                diskTotal,
                diskPercent:
                    diskTotal > 0 ? ((diskUsed / diskTotal) * 100).toFixed(1) : "-",


                lastPing: s.lastPing || null
            };
        });
    };

    // Fetch initial data
    const fetchServers = async () => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/server`);
            const json = await res.json();

            if (json.status === "success") {
                setServers(mapServerData(json.data));
            }
        } catch (error) {
            console.error("Failed to fetch servers:", error);
        }
    };

    // Auto-update lastPingAgo every 1 second
    useEffect(() => {
        const interval = setInterval(() => {
            setServers((prev) =>
                prev.map((s) => ({
                    ...s,
                    lastPingAgo: timeAgo(s.lastPing),
                }))
            );
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Load API data first
        fetchServers();

        // Live socket updates
        socket.on("servers_update", (data) => {
            setServers(mapServerData(data));
        });

        return () => socket.off("servers_update");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-2">
                <div>
                    <h2 className="text-lg font-semibold text-slate-50">Servers</h2>
                    <p className="text-sm text-slate-400 mt-1">
                        Live server monitoring with CPU, Memory and Disk usage.
                    </p>
                </div>
                <button
                    className="text-sm px-3 py-1.5 rounded-lg bg-emerald-500/90 text-slate-950 font-medium hover:bg-emerald-400 transition"
                    onClick={() => setOpenAdd(true)}
                >
                    + Add Server
                </button>
            </div>

            <Table
                columns={[
                    { key: "id", header: "Server ID" },
                    { key: "name", header: "Server Name" },
                    { key: "ip", header: "IP Address" },

                    {
                        key: "status",
                        header: "Status",
                        render: (row) => <StatusBadge status={row.status} />,
                    },

                    {
                        key: "cpu",
                        header: "CPU",
                        render: (row) =>
                            row.status === "DOWN" ? (
                                <span className="text-slate-500 text-xs">-</span>
                            ) : (
                                <span>{row.cpu}%</span>
                            ),
                    },

                    {
                        key: "memory",
                        header: "Memory",
                        render: (row) =>
                            row.status === "DOWN" ? (
                                <span className="text-slate-500 text-xs">-</span>
                            ) : (
                                <span>
                                    {row.memPercent}% ({row.memUsed} / {row.memTotal} GB)
                                </span>
                            ),
                    },

                    {
                        key: "disk",
                        header: "Disk",
                        render: (row) =>
                            row.status === "DOWN" ? (
                                <span className="text-slate-500 text-xs">-</span>
                            ) : (
                                <span>
                                    {row.diskPercent}% ({row.diskUsed} / {row.diskTotal} GB)
                                </span>
                            ),
                    },

                    {
                        key: "lastPingAgo",
                        header: "Last Ping",
                        render: (row) => <span>{timeAgo(row.lastPing)}</span>,
                    },
                ]}
                data={servers}
            />
            <AddServerModal
                open={openAdd}
                onClose={() => setOpenAdd(false)}
                onSuccess={fetchServers}
            />

        </div>
    );
}