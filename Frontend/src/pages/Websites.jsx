import { useEffect, useState } from "react";
import Table from "../components/Table.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import AddWebsiteModal from "../components/AddWebsiteModal.jsx";
import { io } from "socket.io-client";

const socket = io(process.env.REACT_APP_API_URL);

// Format "x seconds ago"
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

export default function Websites() {
    const [websites, setWebsites] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);

    // Convert backend → frontend
    const mapWebsiteData = (data) => {
        return data.map((item) => {
            const domainClean = item.domain
                ?.replace("https://", "")
                ?.replace("http://", "")
                ?.split("/")[0] || "unknown.com";

            return {
                domain: item.domain,

                // Handle both API and cron/socket formats
                server:
                    item.name && item.ip
                        ? `${item.name} (${item.ip})`
                        : item.serverId
                            ? `${item.serverId.name} (${item.serverId.ip})`
                            : "Unknown (No IP)",

                status: item.status,
                latency: item.latency,
                lastCheck: item.lastCheck,
                icon: `https://www.google.com/s2/favicons?domain=${domainClean}&sz=64`,
            };
        });
    };

    const fetchWebsites = async () => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/website`);
            const json = await res.json();

            if (json.status === "success") {
                setWebsites(mapWebsiteData(json.data));
            }
        } catch (error) {
            console.error("Failed to fetch websites:", error);
        }
    };

    useEffect(() => {
        // First load
        fetchWebsites();

        // Live updates
        socket.on("websites_update", (data) => {
            setWebsites(mapWebsiteData(data));
        });

        return () => {
            socket.off("websites_update");
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Auto-update "x seconds ago" every 1 second
    useEffect(() => {
        const interval = setInterval(() => {
            setWebsites((prev) => [...prev]);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-2">
                <div>
                    <h2 className="text-lg font-semibold text-slate-50">Websites</h2>
                    <p className="text-sm text-slate-400 mt-1">
                        Monitored websites and their current status.
                    </p>
                </div>
                <button className="text-sm px-3 py-1.5 rounded-lg bg-emerald-500/90 text-slate-950 font-medium hover:bg-emerald-400 transition"
                    onClick={() => setModalOpen(true)}
                >
                    + Add Website
                </button>
            </div>

            <Table
                columns={[
                    {
                        key: "icon",
                        header: "Logo",
                        render: (row) => (
                            <img
                                src={row.icon}
                                alt="favicon"
                                className="w-6 h-6 rounded-sm border border-slate-700"
                            />
                        ),
                    },
                    { key: "domain", header: "Domain / URL" },
                    {
                        key: "server",
                        header: "Server (Name & IP)",
                        render: (row) => <span>{row.server}</span>,
                    },
                    {
                        key: "status",
                        header: "Status",
                        render: (row) => <StatusBadge status={row.status} />,
                    },
                    {
                        key: "latency",
                        header: "Latency",
                        render: (row) =>
                            row.status === "DOWN" || row.latency == null ? (
                                <span className="text-slate-500 text-xs">-</span>
                            ) : (
                                <span>{row.latency} ms</span>
                            ),
                    },
                    {
                        key: "lastCheck",
                        header: "Last Check",
                        render: (row) => <span>{timeAgo(row.lastCheck)}</span>,
                    },
                ]}
                data={websites}
            />
            {/* Modal */}
            <AddWebsiteModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSuccess={() => fetchWebsites()}
            />
        </div>
    );
}