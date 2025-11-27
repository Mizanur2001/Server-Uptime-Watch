import { useState } from "react";
import { toast } from "sonner";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            toast.error("Please enter email and password");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const json = await res.json();

            if (json.status === "success") {
                localStorage.setItem("token", json.data.token);

                toast.success("Login successful ! Redirecting...");
                setTimeout(() => {
                    window.location.href = "/"; // redirect to dashboard
                }, 2000);
            } else {
                toast.error(json.error || "Invalid credentials");
            }
        } catch (error) {
            toast.error("Failed to connect to server");
        }

        setLoading(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-950 px-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-8 w-full max-w-sm shadow-xl">

                <h2 className="text-2xl font-bold text-slate-50 mb-1">Server Panel Login</h2>
                <p className="text-slate-400 text-sm mb-6">Sign in to continue</p>

                {/* Email */}
                <label className="text-slate-300 text-sm">Email</label>
                <input
                    type="email"
                    className="w-full mt-1 mb-4 px-3 py-2 rounded-lg bg-slate-800 text-slate-100 border border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                {/* Password */}
                <label className="text-slate-300 text-sm">Password</label>
                <input
                    type="password"
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-800 text-slate-100 border border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full mt-6 py-2 rounded-lg bg-emerald-500 text-slate-900 font-semibold hover:bg-emerald-400 transition disabled:opacity-50"
                >
                    {loading ? "Logging in..." : "Login"}
                </button>
            </div>
        </div>
    );
}