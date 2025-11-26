import { useEffect, useState } from "react";
import Table from "../components/Table.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import StatCard from "../components/StatCard.jsx";
import { io } from "socket.io-client";

const socket = io(process.env.REACT_APP_API_URL);

// ⏳ Convert timestamps → “5s ago”
const timeAgo = (timestamp) => {
    if (!timestamp) return "-";
    const diff = Math.floor((Date.now() - new Date(timestamp)) / 1000);

    if (diff < 5) return "just now";
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
};

// Parse "XX GB" → numeric
const parseGB = (value) => {
    if (!value) return 0;
    return parseFloat(String(value).replace("GB", "").trim());
};

export default function Dashboard() {
    const [servers, setServers] = useState([]);
    const [websites, setWebsites] = useState([]);

    // -----------------------
    // Map Server API → UI
    // -----------------------
    const mapServerData = (data) =>
        data.map((s) => {
            const memUsed = parseGB(s.memUsed);
            const memTotal = parseGB(s.memTotal);
            const diskUsed = parseGB(s.diskUsed);
            const diskTotal = parseGB(s.diskTotal);

            return {
                name: s.name,
                status: s.status,
                cpu: s.cpu || 0,

                memPercent: memTotal ? ((memUsed / memTotal) * 100).toFixed(1) : "-",
                diskPercent: diskTotal ? ((diskUsed / diskTotal) * 100).toFixed(1) : "-",

                lastPing: s.lastPing,
            };
        });

    // -----------------------
    // Map Website API → UI
    // -----------------------
    const mapWebsiteData = (data) =>
        data.map((item) => {
            const domain = item.domain
                ?.replace("https://", "")
                ?.replace("http://", "")
                ?.split("/")[0];

            return {
                domain: item.domain,
                status: item.status,
                lastCheck: item.lastCheck,
                icon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
            };
        });

    // Fetch initial data
    const fetchDashboardData = async () => {
        try {
            const serverRes = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/server`);
            const serverJson = await serverRes.json();
            if (serverJson.status === "success") {
                setServers(mapServerData(serverJson.data));
            }

            const siteRes = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/website`);
            const siteJson = await siteRes.json();
            if (siteJson.status === "success") {
                setWebsites(mapWebsiteData(siteJson.data));
            }
        } catch (error) {
            console.error("Dashboard fetch failed:", error);
        }
    };

    useEffect(() => {
        fetchDashboardData();

        socket.on("servers_update", (data) => {
            setServers(mapServerData(data));
        });

        socket.on("websites_update", (data) => {
            setWebsites(mapWebsiteData(data));
        });

        return () => {
            socket.off("servers_update");
            socket.off("websites_update");
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Auto-update “1s ago”
    useEffect(() => {
        const interval = setInterval(() => {
            setServers((s) => [...s]);
            setWebsites((w) => [...w]);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-50">Dashboard</h2>
            <p className="text-sm text-slate-400 mt-1">
                Live monitoring of servers & websites.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard label="Total Servers" value={servers.length} />
                <StatCard
                    label="Servers Down"
                    value={servers.filter((s) => s.status === "DOWN").length}
                />
                <StatCard label="Total Websites" value={websites.length} />
                <StatCard
                    label="Sites Down"
                    value={websites.filter((w) => w.status === "DOWN").length}
                />
            </div>

            {/* 2 Section Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Servers */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-slate-100">Servers</h3>
                        <span className="text-xs text-slate-500">
                            {servers.length} total
                        </span>
                    </div>

                    <Table
                        columns={[
                            { key: "name", header: "Name" },
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
                                key: "memPercent",
                                header: "Memory",
                                render: (row) =>
                                    row.status === "DOWN"
                                        ? "-"
                                        : `${row.memPercent}%`,
                            },
                            {
                                key: "diskPercent",
                                header: "Disk",
                                render: (row) =>
                                    row.status === "DOWN"
                                        ? "-"
                                        : `${row.diskPercent}%`,
                            },
                            {
                                key: "lastPing",
                                header: "Last Ping",
                                render: (row) => timeAgo(row.lastPing),
                            },
                        ]}
                        data={servers}
                    />
                </div>

                {/* Websites */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-slate-100">Websites</h3>
                        <span className="text-xs text-slate-500">
                            {websites.length} total
                        </span>
                    </div>

                    <Table
                        columns={[
                            {
                                key: "icon",
                                header: "Logo",
                                render: (row) => (
                                    <img
                                        src={row.icon}
                                        className="w-6 h-6 rounded border border-slate-700"
                                        alt="favicon"
                                    />
                                ),
                            },
                            { key: "domain", header: "Domain" },
                            {
                                key: "status",
                                header: "Status",
                                render: (row) => <StatusBadge status={row.status} />,
                            },
                            {
                                key: "lastCheck",
                                header: "Last Check",
                                render: (row) => timeAgo(row.lastCheck),
                            },
                        ]}
                        data={websites}
                    />
                </div>
            </div>
        </div>
    );
}
