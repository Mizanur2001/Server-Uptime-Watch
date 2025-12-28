import { useState } from "react";
import { toast } from "sonner";
import { 
  Cpu, Lock, Mail, ArrowRight, 
  ShieldCheck, Loader2, Terminal 
} from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const version = import.meta.env.REACT_APP_VERSION;

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent form submission refresh
    
    if (!email || !password) {
      toast.error("Credentials required");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.REACT_APP_API_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();

      if (json.status === "success") {
        localStorage.setItem("token", json.data.token);
        toast.success("Identity Verified. Access Granted.");
        
        // Slight delay for effect
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      } else {
        toast.error(json.error || "Access Denied");
      }
    } catch (error) {
      toast.error("Server Unreachable");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] relative overflow-hidden font-sans selection:bg-cyan-500/30">
      
      {/* 1. Background Effects */}
      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
      {/* Glow Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[100px]"></div>

      {/* 2. Main Card */}
      <div className="relative w-full max-w-md z-10 px-4">
        
        {/* Decorative Top Label */}
        <div className="flex justify-center mb-6">
           <div className="px-3 py-1 bg-slate-900/50 border border-slate-700/50 rounded-full flex items-center gap-2 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-mono text-emerald-500 tracking-widest uppercase">System Secure</span>
           </div>
        </div>

        {/* The Glass Card */}
        <div className="bg-[#0B1120]/60 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden relative">
          
          {/* Animated Top Border Line */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>

          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
               <div className="w-12 h-12 bg-slate-900 border border-slate-700 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <Cpu className="text-cyan-400" size={24} />
               </div>
               <h2 className="text-2xl font-bold text-white tracking-tight">Access Control</h2>
               <p className="text-slate-500 text-sm mt-2 font-mono">Enter credentials to authenticate.</p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-400 uppercase tracking-wider ml-1">Identity</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                  </div>
                  <input
                    type="email"
                    required
                    className="block w-full pl-10 pr-3 py-2.5 bg-[#020617]/50 border border-slate-700 rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono text-sm"
                    placeholder="admin@mainframe.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-400 uppercase tracking-wider ml-1">Passcode</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                  </div>
                  <input
                    type="password"
                    required
                    className="block w-full pl-10 pr-3 py-2.5 bg-[#020617]/50 border border-slate-700 rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono text-sm"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full relative group overflow-hidden bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold py-2.5 rounded-lg transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-cyan-900/20"
              >
                <div className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      <span className="font-mono text-sm">VERIFYING...</span>
                    </>
                  ) : (
                    <>
                      <span className="font-mono text-sm">AUTHENTICATE</span>
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
                {/* Shine Effect */}
                <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
              </button>

            </form>
          </div>

          {/* Footer */}
          <div className="bg-[#050912]/50 border-t border-slate-800 p-4 flex justify-between items-center text-[10px] text-slate-500 font-mono">
             <div className="flex items-center gap-1.5">
               <ShieldCheck size={12} className="text-slate-600" />
               <span>256-BIT ENCRYPTION</span>
             </div>
             <div className="flex items-center gap-1.5">
               <Terminal size={12} className="text-slate-600" />
               <span>V.{version}</span>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}