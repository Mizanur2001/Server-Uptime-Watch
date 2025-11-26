import { useState } from "react";
import { toast } from "sonner";

export default function AddServerModal({ open, onClose, onSuccess }) {
    const [name, setName] = useState("");
    const [ip, setIp] = useState("");
    const [port, setPort] = useState("");
    const [apiKey, setApiKey] = useState("");

    if (!open) return null;

    // Validate IP address format
    const isValidIP = (value) => {
        const regex =
            /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        return regex.test(value);
    };

    const handleSubmit = async () => {
        if (!name || !ip || !port || !apiKey) {
            toast.error("Please fill all fields!", { duration: 4000 });
            return;
        }

        if (!isValidIP(ip)) {
            toast.error("Invalid IP address format!", { duration: 4000 });
            return;
        }

        if (isNaN(port) || Number(port) < 1 || Number(port) > 65535) {
            toast.error("Invalid port number!", { duration: 4000 });
            return;
        }

        const payload = {
            name,
            ip,
            port: Number(port),
            apiKey
        };

        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/server/add`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const json = await res.json();

            if (json.status === "success") {
                toast.success("Server added successfully!");
                onSuccess();
                onClose();
            } else {
                toast.error(json.error || "Failed to add server.");
            }

        } catch (err) {
            toast.error("Error while adding server.", { duration: 4000 });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-900 border border-slate-700 shadow-xl rounded-xl p-6 w-[400px]">

                <h2 className="text-lg font-semibold text-slate-50">Add Server</h2>
                <p className="text-sm text-slate-400 mb-4">
                    Provide server information for monitoring.
                </p>

                {/* Name */}
                <label className="text-sm text-slate-300">Server Name</label>
                <input
                    type="text"
                    placeholder="My Server"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full mt-1 mb-3 px-3 py-2 rounded-lg bg-slate-800 text-slate-100 border border-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                />

                {/* IP */}
                <label className="text-sm text-slate-300">Server IP</label>
                <input
                    type="text"
                    placeholder="159.89.161.8"
                    value={ip}
                    onChange={(e) => setIp(e.target.value)}
                    className="w-full mt-1 mb-3 px-3 py-2 rounded-lg bg-slate-800 text-slate-100 border border-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                />

                {/* Port */}
                <label className="text-sm text-slate-300">Port</label>
                <input
                    type="number"
                    placeholder="4000"
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    className="w-full mt-1 mb-3 px-3 py-2 rounded-lg bg-slate-800 text-slate-100 border border-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                />

                {/* API Key */}
                <label className="text-sm text-slate-300">API Key</label>
                <input
                    type="text"
                    placeholder="Your secret API key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full mt-1 mb-3 px-3 py-2 rounded-lg bg-slate-800 text-slate-100 border border-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                />

                {/* Footer */}
                <div className="flex justify-end gap-2 mt-6">
                    <button
                        className="px-3 py-1.5 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600"
                        onClick={onClose}
                    >
                        Cancel
                    </button>

                    <button
                        className="px-3 py-1.5 bg-emerald-500 text-slate-900 rounded-lg font-medium hover:bg-emerald-400"
                        onClick={handleSubmit}
                    >
                        Add Server
                    </button>
                </div>
            </div>
        </div>
    );
}
