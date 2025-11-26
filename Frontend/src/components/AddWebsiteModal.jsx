import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AddWebsiteModal({ open, onClose, onSuccess }) {
    const [domain, setDomain] = useState("");
    const [serverId, setServerId] = useState("");
    const [servers, setServers] = useState([]);

    useEffect(() => {
        if (open) fetchServers();
    }, [open]);

    const fetchServers = async () => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/server`);
            const json = await res.json();
            if (json.status === "success") setServers(json.data);
        } catch (err) {
            console.error("Error loading servers:", err);
        }
    };

    const validateDomain = () => {
        if (!domain) return false;

        // Must start with https://
        if (!domain.startsWith("https://")) {
            if (domain.startsWith("http://")) {
                toast.error("Please use HTTPS — http:// is not allowed.", { duration: 5000 });
                return false;
            }

            toast.error("Please include https:// in the domain.", { duration: 5000 });
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!domain || !serverId) {
            toast.error("Please fill all fields", { duration: 4000 });
            return;
        }

        // 🔍 Validate domain protocol (HTTPS required)
        if (!validateDomain()) return;

        const payload = { domain, serverId };

        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/website/add`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const json = await res.json();

            if (json.status === "success") {
                onSuccess();
                onClose();
                toast.success("Website added successfully!", { duration: 4000 });
                setDomain("");
                setServerId("");
            } else {
                toast.error(json.error, { duration: 6000 });
            }
        } catch (err) {
            toast.error("Failed to add website.", { duration: 4000 });
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
                <label className="text-sm text-slate-300">Full Domain</label>
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