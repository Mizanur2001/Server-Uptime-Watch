import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AddWebsiteModal({ open, onClose, onSuccess }) {
    const [domain, setDomain] = useState("");
    const [serverId, setServerId] = useState("");
    const [servers, setServers] = useState([]);

    const token = localStorage.getItem("token");

    useEffect(() => {
        if (open) fetchServers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    // 🔐 Secure fetch helper
    const secureFetch = async (url, options = {}) => {
        return fetch(url, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                ...(options.headers || {})
            }
        });
    };

    // Load all servers
    const fetchServers = async () => {
        try {
            const res = await secureFetch(`${process.env.REACT_APP_API_URL}/api/v1/server`);
            const json = await res.json();

            if (json.error === "Invalid or expired token") {
                toast.error("Session expired. Please log in again.");
                localStorage.removeItem("token");
                return window.location.href = "/login";
            }

            if (json.status === "success") {
                setServers(json.data);
            }
        } catch (err) {
            console.error("Error loading servers:", err);
        }
    };

    // Domain validation (HTTPS required)
    const validateDomain = () => {
        if (!domain) return false;

        if (!domain.startsWith("https://")) {
            toast.error("Domain must include https://", { duration: 4000 });
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!domain || !serverId) {
            toast.error("Please fill all fields");
            return;
        }

        if (!validateDomain()) return;

        const payload = { domain, serverId };

        try {
            const res = await secureFetch(
                `${process.env.REACT_APP_API_URL}/api/v1/website/add`,
                {
                    method: "POST",
                    body: JSON.stringify(payload),
                }
            );

            const json = await res.json();

            if (json.error === "Invalid or expired token") {
                toast.error("Session expired. Please log in again.");
                localStorage.removeItem("token");
                return window.location.href = "/login";
            }

            if (json.status === "success") {
                toast.success("Website added successfully!");

                setDomain("");
                setServerId("");
                onSuccess(); // refresh list
                onClose();   // close modal
            } else {
                toast.error(json.error || "Failed to add website");
            }

        } catch (err) {
            toast.error("Failed to add website. Check console.");
            console.error(err);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-900 border border-slate-700 shadow-xl rounded-xl p-6 w-[400px]">

                <h2 className="text-lg font-semibold text-slate-50">Add Website</h2>
                <p className="text-sm text-slate-400 mb-4">
                    Provide the website URL and map it to a server.
                </p>

                {/* Domain Input */}
                <label className="text-sm text-slate-300">Full Domain (HTTPS required)</label>
                <input
                    type="text"
                    placeholder="https://example.com"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="w-full mt-1 mb-3 px-3 py-2 rounded-lg bg-slate-800 text-slate-100 border border-slate-700 
                                focus:ring-2 focus:ring-emerald-500 outline-none"
                />

                {/* Server Select */}
                <label className="text-sm text-slate-300">Select Server</label>
                <select
                    value={serverId}
                    onChange={(e) => setServerId(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-800 text-slate-100 border border-slate-700 
                                focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                    <option value="">Select server</option>
                    {servers.map((s) => (
                        <option key={s._id} value={s._id}>
                            {s.name} ({s.ip})
                        </option>
                    ))}
                </select>

                {/* Buttons */}
                <div className="flex justify-end gap-2 mt-6">
                    <button
                        className="px-3 py-1.5 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600"
                        onClick={onClose}
                    >
                        Cancel
                    </button>

                    <button
                        className="px-3 py-1.5 bg-emerald-500 text-slate-900 rounded-lg font-medium hover:bg-emerald-400"
                        onClick={handleSubmit}
                    >
                        Add
                    </button>
                </div>
            </div>
        </div>
    );
}