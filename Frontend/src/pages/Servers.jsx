import { useEffect, useState } from "react";
import Table from "../components/Table.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import AddServerModal from "../components/AddServerModal.jsx";
import { io } from "socket.io-client";
import { toast } from "sonner";

const token = localStorage.getItem("token");

// 🔐 Secure socket connection
const socket = io(process.env.REACT_APP_API_URL, {
    auth: { token }
});

// Convert "timestamp → 5s ago"
const timeAgo = (date) => {
    if (!date) return "-";
    const now = new Date();
    const diff = Math.floor((now - new Date(date)) / 1000);

    if (diff < 5) return "just now";
    if (diff < 60) return `${diff}s ago`;

    const min = Math.floor(diff / 60);
    if (min < 60) return `${min}m ago`;

    const hrs = Math.floor(min / 60);
    if (hrs < 24) return `${hrs}h ago`;

    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
};

// Parse "3.82 GB" → 3.82
const parseGB = (value) => {
    if (!value) return 0;
    return parseFloat(String(value).replace("GB", "").trim());
};

export default function Servers() {
    const [servers, setServers] = useState([]);
    const [openAdd, setOpenAdd] = useState(false);

    // ---------------------------------------------
    // Map Backend → UI format
    // ---------------------------------------------
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

                memUsed,
                memTotal,
                memPercent:
                    memTotal > 0 ? ((memUsed / memTotal) * 100).toFixed(1) : "-",

                diskUsed,
                diskTotal,
                diskPercent:
                    diskTotal > 0 ? ((diskUsed / diskTotal) * 100).toFixed(1) : "-",

                lastPing: s.lastPing || null,
            };
        });
    };

    // ---------------------------------------------
    // Secure fetch wrapper
    // ---------------------------------------------
    const secureFetch = async (url) => {
        return fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    };

    // ---------------------------------------------
    // Fetch API Data
    // ---------------------------------------------
    const fetchServers = async () => {
        try {
            const res = await secureFetch(
                `${process.env.REACT_APP_API_URL}/api/v1/server`
            );
            const json = await res.json();

            if (json.error === "Invalid or expired token") {
                toast.error("Session expired. Please login again.");
                localStorage.removeItem("token");
                setTimeout(() => (window.location.href = "/login"), 1500);
                return;
            }

            if (json.status === "success") {
                setServers(mapServerData(json.data));
            }
        } catch (error) {
            console.error("Failed to fetch servers:", error);
        }
    };

    // ---------------------------------------------
    // Initial Load + Socket Events
    // ---------------------------------------------
    useEffect(() => {
        fetchServers();

        socket.on("servers_update", (data) => {
            setServers(mapServerData(data));
        });

        return () => socket.off("servers_update");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ---------------------------------------------
    // Auto “1s ago” refresh every second
    // ---------------------------------------------
    useEffect(() => {
        const interval = setInterval(() => {
            setServers((prev) => [...prev]);
        }, 1000);
        return () => clearInterval(interval);
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
                            row.status === "DOWN" ? "-" : `${row.cpu}%`,
                    },

                    {
                        key: "memory",
                        header: "Memory",
                        render: (row) =>
                            row.status === "DOWN" ? (
                                "-"
                            ) : (
                                <>
                                    {row.memPercent}% ({row.memUsed} / {row.memTotal} GB)
                                </>
                            ),
                    },

                    {
                        key: "disk",
                        header: "Disk",
                        render: (row) =>
                            row.status === "DOWN" ? (
                                "-"
                            ) : (
                                <>
                                    {row.diskPercent}% ({row.diskUsed} / {row.diskTotal} GB)
                                </>
                            ),
                    },

                    {
                        key: "lastPing",
                        header: "Last Ping",
                        render: (row) => timeAgo(row.lastPing),
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