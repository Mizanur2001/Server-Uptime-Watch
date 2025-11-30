import { useEffect, useState } from "react";
import AddServerModal from "../components/AddServerModal.jsx";
import { io } from "socket.io-client";
import { toast } from "sonner";
import { 
  Server, HardDrive, Activity, Plus, Search, 
  Terminal, ArrowDownUp, Fan, AlertTriangle 
} from "lucide-react";

// ==========================================
// 1. CONFIG & UTILS
// ==========================================
const token = localStorage.getItem("token");

const socket = token
  ? io(process.env.REACT_APP_API_URL, { auth: { token } })
  : null;

const timeAgo = (date) => {
  if (!date) return "--";
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 5) return "LIVE";
  if (diff < 60) return `${diff}s`;
  const min = Math.floor(diff / 60);
  if (min < 60) return `${min}m`;
  return `${Math.floor(min / 60)}h`;
};

const parseGB = (value) => {
  if (!value) return 0;
  return parseFloat(String(value).replace("GB", "").trim());
};

// ==========================================
// 2. SUB-COMPONENTS
// ==========================================

// --- Circular CPU Gauge ---
const CpuGauge = ({ value }) => {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const color = value > 80 ? "stroke-red-500" : value > 50 ? "stroke-violet-500" : "stroke-cyan-500";

  return (
    <div className="relative flex items-center justify-center w-20 h-20 bg-slate-900/50 rounded-full border border-slate-800 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
      <svg width="70" height="70" className="transform -rotate-90">
        <circle cx="35" cy="35" r={radius} className="stroke-slate-800" strokeWidth="6" fill="transparent" />
        <circle
          cx="35"
          cy="35"
          r={radius}
          className={`${color} transition-all duration-1000 ease-out`}
          strokeWidth="6"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-white font-mono">{value}%</span>
        <span className="text-[8px] text-slate-500 font-mono">CPU</span>
      </div>
    </div>
  );
};

// --- Metric Row (Updated with Percentage) ---
const MetricRow = ({ icon: Icon, label, used, total, percent, colorFrom, colorTo, textColor }) => (
  <div className="w-full font-mono">
    {/* Row 1: Label (Left) and Percentage (Right) */}
    <div className="flex justify-between items-center mb-1.5">
      <div className="flex items-center gap-2 text-slate-400 text-[10px] uppercase tracking-wider">
        <Icon size={12} className={colorFrom.replace('from-', 'text-')} /> 
        {label}
      </div>
      <span className={`text-xs font-bold ${textColor}`}>
        {percent}%
      </span>
    </div>
    
    {/* Row 2: Progress Bar */}
    <div className="h-1.5 w-full bg-slate-900 rounded-sm border border-slate-800/50 overflow-hidden relative">
      <div 
        className={`h-full bg-gradient-to-r ${colorFrom} ${colorTo} transition-all duration-700 relative`} 
        style={{ width: `${percent}%` }}
      >
        <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-white/50 blur-[1px]"></div>
      </div>
    </div>

    {/* Row 3: Capacity Details (Bottom Right) */}
    <div className="text-right mt-1">
       <span className="text-[11px] text-slate-500">
         <span className="text-slate-300">{used}</span> / {total} GB
       </span>
    </div>
  </div>
);

// --- THE MAIN CARD: SERVER BLADE ---
const ServerBlade = ({ server }) => {
  const isOnline = server.status === "UP";

  return (
    <div className="group relative bg-[#0B1120] border border-slate-800 rounded-lg overflow-hidden transition-all duration-300 hover:border-cyan-500/40 hover:shadow-[0_0_30px_rgba(8,145,178,0.1)]">
      
      {/* ---------------- HEADER ---------------- */}
      <div className="bg-[#111827] border-b border-slate-800 p-3 flex justify-between items-center relative overflow-hidden font-mono">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(6,182,212,0.05)_50%,transparent_100%)] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none"></div>

        {/* Left: Name & Status */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="relative flex items-center justify-center w-3 h-3">
             {isOnline && <div className="absolute w-full h-full rounded-full bg-emerald-500 opacity-60 animate-ping"></div>}
             <div className={`relative w-2.5 h-2.5 rounded-full shadow-lg ${isOnline ? "bg-emerald-400 shadow-emerald-500/50" : "bg-red-500"}`}></div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 tracking-wide uppercase">{server.name}</h3>
            <div className="text-[10px] text-slate-500 flex items-center gap-2">
              <span className="text-slate-600">{server.ip}</span>
            </div>
          </div>
        </div>

        {/* Right: NETWORK LIGHTS */}
        {isOnline && (
          <div className="flex items-center gap-3 relative z-10 border-l border-slate-800 pl-3">
             <div className="flex gap-1.5">
                <div className="flex flex-col items-center gap-[2px]">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981] animate-flash" style={{animationDuration: '0.6s'}}></div>
                   <span className="text-[6px] text-slate-600 font-bold">RX</span>
                </div>
                <div className="flex flex-col items-center gap-[2px]">
                   <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_5px_#f59e0b] animate-flash" style={{animationDuration: '0.3s', animationDelay: '0.1s'}}></div>
                   <span className="text-[6px] text-slate-600 font-bold">TX</span>
                </div>
                 <div className="flex flex-col items-center gap-[2px]">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_5px_#3b82f6] animate-flash" style={{animationDuration: '0.9s'}}></div>
                   <span className="text-[6px] text-slate-600 font-bold">WX</span>
                </div>
             </div>
             
             <div className="text-[10px] text-slate-500 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
               {isOnline ? `PING: ${timeAgo(server.lastPing)}` : "ERR"}
             </div>
          </div>
        )}
      </div>

      {/* ---------------- BODY ---------------- */}
      {isOnline ? (
        <div className="p-5 flex items-center gap-6 relative">
           <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
           
           {/* Left Side: CPU */}
           <div className="flex-shrink-0 relative z-10">
              <CpuGauge value={server.cpu || 0} />
           </div>

           {/* VERTICAL DIVIDER */}
           <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-slate-700 to-transparent"></div>

           {/* Right Side: Memory & Storage */}
           <div className="flex-1 space-y-4 relative z-10">
              <MetricRow 
                icon={Activity} 
                label="MEMORY" 
                used={server.memUsed} 
                total={server.memTotal} 
                percent={server.memPercent} 
                colorFrom="from-violet-600" 
                colorTo="to-fuchsia-500" 
                textColor="text-fuchsia-400" 
              />
              <MetricRow 
                icon={HardDrive} 
                label="STORAGE" 
                used={server.diskUsed} 
                total={server.diskTotal} 
                percent={server.diskPercent} 
                colorFrom="from-cyan-600" 
                colorTo="to-blue-500" 
                textColor="text-cyan-400" 
              />
           </div>
        </div>
      ) : (
        <div className="p-8 flex flex-col items-center justify-center text-center gap-3 min-h-[140px]">
           <AlertTriangle className="text-red-500 animate-pulse" size={32} />
           <div className="font-mono text-red-500 text-sm tracking-widest">SIGNAL_LOST</div>
           <p className="text-xs text-slate-600 font-mono">Check physical connection.</p>
        </div>
      )}

      {/* ---------------- FOOTER (FANS) ---------------- */}
      <div className="bg-[#050910] border-t border-slate-800 h-9 relative overflow-hidden flex items-center justify-between px-4">
          <span className="text-[9px] font-mono text-slate-600 relative z-10">ID: {server.id.substring(0,8)}</span>

          {isOnline && (
            <div className="absolute inset-0 flex items-center justify-center gap-4 pointer-events-none">
                {/* Left Vents */}
                <div className="flex gap-[2px] opacity-20">
                   {[...Array(6)].map((_, i) => <div key={i} className="w-[1px] h-3 bg-slate-400"></div>)}
                </div>
                {/* FANS */}
                <div className="flex gap-3">
                   <Fan size={18} className="text-slate-500 animate-fan" />
                   <Fan size={18} className="text-slate-500 animate-fan-fast" />
                </div>
                {/* Right Vents */}
                 <div className="flex gap-[2px] opacity-20">
                   {[...Array(6)].map((_, i) => <div key={i} className="w-[1px] h-3 bg-slate-400"></div>)}
                </div>
            </div>
          )}

          <span className="text-[9px] font-mono text-cyan-600 flex items-center gap-1 relative z-10">
             <ArrowDownUp size={10} /> 1GBPS
          </span>
      </div>
    </div>
  );
};

// ==========================================
// 3. MAIN PAGE LOGIC
// ==========================================
export default function Servers() {
  const [servers, setServers] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [search, setSearch] = useState("");

  const mapServerData = (data) =>
    data.map((s) => {
      const memUsed = parseGB(s.memUsed);
      const memTotal = parseGB(s.memTotal);
      const diskUsed = parseGB(s.diskUsed);
      const diskTotal = parseGB(s.diskTotal);

      return {
        id: s._id || s.id || "N/A",
        name: s.name,
        ip: s.ip || "192.168.x.x",
        status: s.status,
        cpu: s.cpu ?? 0,
        memUsed, memTotal,
        memPercent: memTotal > 0 ? ((memUsed / memTotal) * 100).toFixed(1) : 0,
        diskUsed, diskTotal,
        diskPercent: diskTotal > 0 ? ((diskUsed / diskTotal) * 100).toFixed(1) : 0,
        lastPing: s.lastPing || null,
      };
    });

  const secureFetch = async (url) => {
    return fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  };

  const fetchServers = async () => {
    try {
      const res = await secureFetch(`${process.env.REACT_APP_API_URL}/api/v1/server`);
      const json = await res.json();

      if (json.error === "Invalid or expired token") {
        toast.error("Session expired");
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      if (json.status === "success") {
        setServers(mapServerData(json.data));
      }
    } catch (error) {
      console.error("Failed to fetch servers:", error);
    }
  };

  useEffect(() => {
    fetchServers();
    if (socket) {
      socket.on("servers_update", (data) => setServers(mapServerData(data)));
    }
    return () => { if (socket) socket.off("servers_update"); };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setServers((prev) => [...prev]), 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredServers = servers.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.ip.includes(search)
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Server className="text-cyan-500" /> 
            <span>Active Nodes</span>
          </h2>
          <p className="text-xs font-mono text-slate-500 mt-2 flex items-center gap-2">
            <Terminal size={12} className="text-emerald-500" />
            <span>Connection established. Monitoring {servers.length} units.</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
           <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-500 group-focus-within:text-cyan-400" />
            </div>
            <input
              type="text"
              className="bg-[#0B1120] border border-slate-700 text-slate-200 text-sm rounded-md focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 block w-full pl-10 p-2.5 font-mono placeholder:text-slate-600"
              placeholder="SEARCH_NODE_ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => setOpenAdd(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold font-mono rounded-md transition-all shadow-[0_0_10px_rgba(8,145,178,0.4)]"
          >
            <Plus size={14} /> DEPLOY_NEW
          </button>
        </div>
      </div>

      {filteredServers.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-lg text-slate-500 font-mono">
           <AlertTriangle size={32} className="mb-4 opacity-50"/>
           <span>NO_NODES_FOUND</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
          {filteredServers.map((server) => (
            <ServerBlade key={server.id} server={server} />
          ))}
        </div>
      )}

      <AddServerModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSuccess={fetchServers}
      />
    </div>
  );
}