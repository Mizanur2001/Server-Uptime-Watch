import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Server, Globe, Activity, AlertCircle, HardDrive, Terminal } from "lucide-react";
import { toast } from "sonner";

// ======================================================
// CONFIG & UTILS
// ======================================================
const token = localStorage.getItem("token");

const socket = token
  ? io(process.env.REACT_APP_API_URL, {
      auth: { token },
      autoConnect: true,
    })
  : null;

const timeAgo = (timestamp) => {
  if (!timestamp) return "-";
  const diff = Math.floor((Date.now() - new Date(timestamp)) / 1000);
  if (diff < 5) return "Live";
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
};

const parseGB = (value) => {
  if (!value) return 0;
  return parseFloat(String(value).replace("GB", "").trim());
};

// ======================================================
// NEW "SERVER FEELING" COMPONENTS
// ======================================================

// 1. The Circular Gauge (Refined for Tech Look)
const TechGauge = ({ value, label }) => {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  
  // Dynamic Color
  const colorClass = value > 80 ? "stroke-red-500" : value > 50 ? "stroke-violet-500" : "stroke-cyan-500";

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Outer Glow Ring */}
      <div className="absolute inset-0 bg-cyan-500/5 blur-xl rounded-full" />
      
      <svg width="90" height="90" className="transform -rotate-90 relative z-10">
        {/* Track */}
        <circle cx="45" cy="45" r={radius} className="stroke-slate-800" strokeWidth="6" fill="transparent" />
        {/* Fill */}
        <circle
          cx="45"
          cy="45"
          r={radius}
          className={`${colorClass} transition-all duration-1000 ease-out`}
          strokeWidth="6"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
        <span className="text-xl font-mono font-bold text-white tracking-tighter">{value}%</span>
        <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">{label}</span>
      </div>
    </div>
  );
};

// 2. The Bar (Tech Style)
const TechBar = ({ value, label, total }) => {
  return (
    <div className="w-full mt-3 font-mono">
      <div className="flex justify-between text-[10px] uppercase tracking-wider mb-1">
        <span className="text-slate-400 flex items-center gap-1">
          {label === "Memory" ? <Activity size={10}/> : <HardDrive size={10}/>} {label}
        </span>
        <span className="text-cyan-400">{value}%</span>
      </div>
      <div className="w-full bg-slate-900 border border-slate-800 h-2 relative overflow-hidden">
        {/* Scanline texture inside the bar */}
        <div 
          className="h-full bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 transition-all duration-700 relative"
          style={{ width: `${value}%` }}
        >
             <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] w-full opacity-50" />
        </div>
      </div>
      {total && <div className="text-[9px] text-right text-slate-600 mt-1">CAPACITY: {total}</div>}
    </div>
  );
};

// 3. THE SERVER CARD (The main visual upgrade)
const ServerCard = ({ server }) => {
  const isOnline = server.status === "UP" || server.status === "200";

  return (
    <div className="group relative bg-[#0B1120] border border-slate-800 rounded-sm overflow-hidden hover:border-slate-600 transition-all duration-300">
      
      {/* 1. Top Decorative "Rack" Strip */}
      <div className="h-1 w-full bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 opacity-50"></div>

      {/* 2. Background Grid Pattern (Cyberpunk mesh) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '10px 10px' }}>
      </div>

      <div className="p-5 relative z-10">
        {/* Header: Name + Blinking Lights */}
        <div className="flex justify-between items-start mb-6 border-b border-slate-800/50 pb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
               <h3 className="font-mono font-bold text-lg text-slate-100 tracking-tight uppercase">
                 {server.name}
               </h3>
               {/* Server Status LED */}
               <div className={`w-2 h-2 rounded-full ${isOnline ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-red-500 shadow-[0_0_8px_#ef4444]"} animate-pulse`}></div>
            </div>
            
            {/* Fake Terminal Data */}
            <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500">
               <span>ID: <span className="text-slate-400">SRV-{server.name.substring(0,3).toUpperCase()}</span></span>
               <span className="text-slate-700">|</span>
               <span>PING: <span className={isOnline ? "text-emerald-400" : "text-red-400"}>{timeAgo(server.lastPing)}</span></span>
            </div>
          </div>

          {/* Activity Lights Simulation */}
          <div className="flex gap-1">
             <div className="w-1 h-3 bg-slate-800 rounded-sm overflow-hidden">
                <div className="w-full h-full bg-emerald-500 animate-[pulse_0.5s_infinite]"></div>
             </div>
             <div className="w-1 h-3 bg-slate-800 rounded-sm overflow-hidden">
                <div className="w-full h-full bg-yellow-500 animate-[pulse_1.2s_infinite]"></div>
             </div>
             <div className="w-1 h-3 bg-slate-800 rounded-sm overflow-hidden">
                <div className="w-full h-full bg-blue-500 animate-[pulse_0.2s_infinite]"></div>
             </div>
          </div>
        </div>

        {/* Content Body */}
        {server.status === "DOWN" ? (
          <div className="h-32 flex flex-col items-center justify-center text-red-500 font-mono text-xs border border-dashed border-slate-800 bg-red-500/5">
            <AlertCircle className="mb-2" size={20} />
            <span>CRITICAL ERROR</span>
            <span>NO CARRIER</span>
          </div>
        ) : (
          <div className="flex gap-4 items-center">
            {/* Left: Gauge */}
            <div className="w-1/3 flex justify-center border-r border-slate-800 border-dashed pr-2">
              <TechGauge value={server.cpu || 0} label="CPU" />
            </div>

            {/* Right: Bars */}
            <div className="w-2/3 flex flex-col justify-center pl-1">
              <TechBar value={server.memPercent} label="Memory" total={server.formattedMemTotal} />
              <TechBar value={server.diskPercent} label="Storage" total={server.formattedDiskTotal} />
            </div>
          </div>
        )}
      </div>

      {/* 3. Bottom "Vents" decoration */}
      <div className="h-2 w-full bg-[#050912] flex justify-center gap-[2px] items-center border-t border-slate-800">
         {[...Array(20)].map((_, i) => (
            <div key={i} className="w-[2px] h-1 bg-slate-800 rounded-full"></div>
         ))}
      </div>
    </div>
  );
};

// ======================================================
// MAIN DASHBOARD COMPONENT
// ======================================================
export default function Dashboard() {
  const [servers, setServers] = useState([]);
  const [websites, setWebsites] = useState([]);

  // --- Mappers ---
  const mapServerData = (data) =>
    data.map((s) => {
      const memUsed = parseGB(s.memUsed);
      const memTotal = parseGB(s.memTotal);
      const diskUsed = parseGB(s.diskUsed);
      const diskTotal = parseGB(s.diskTotal);

      return {
        ...s,
        memPercent: memTotal ? ((memUsed / memTotal) * 100).toFixed(1) : 0,
        diskPercent: diskTotal ? ((diskUsed / diskTotal) * 100).toFixed(1) : 0,
        formattedMemTotal: s.memTotal,
        formattedDiskTotal: s.diskTotal,
      };
    });

  const mapWebsiteData = (data) =>
    data.map((w) => {
      const domain = w.domain
        ?.replace("https://", "")
        ?.replace("http://", "")
        ?.split("/")[0];
      return {
        ...w,
        cleanDomain: domain,
        icon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
      };
    });

  // --- Fetch Logic ---
  const secureFetch = async (url) => {
    return fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  };

  const fetchDashboardData = async () => {
    try {
      const serverRes = await secureFetch(`${process.env.REACT_APP_API_URL}/api/v1/server`);
      const serverJson = await serverRes.json();

      if (serverJson.error === "Invalid or expired token") {
        toast.error("Session expired");
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      if (serverJson.status === "success") setServers(mapServerData(serverJson.data));

      const siteRes = await secureFetch(`${process.env.REACT_APP_API_URL}/api/v1/website`);
      const siteJson = await siteRes.json();
      if (siteJson.status === "success") setWebsites(mapWebsiteData(siteJson.data));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    if (socket) {
      socket.on("servers_update", (data) => setServers(mapServerData(data)));
      socket.on("websites_update", (data) => setWebsites(mapWebsiteData(data)));
    }
    return () => { if (socket) { socket.off("servers_update"); socket.off("websites_update"); } };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setServers((s) => [...s]), 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">System<span className="text-cyan-500">_Overview</span></h1>
          <p className="text-slate-500 text-sm font-mono mt-1 flex items-center gap-2">
            <Terminal size={14} className="text-cyan-500" />
            root@admin-panel:~$ ./monitor --live
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT: SERVERS */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 mb-2">
             <Server size={18} className="text-cyan-500"/>
             <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Infrastructure</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {servers.map((server) => (
              <ServerCard key={server.name} server={server} />
            ))}
          </div>
        </div>

        {/* RIGHT: WEBSITES */}
        <div className="space-y-4">
           <div className="flex items-center gap-2 mb-2">
             <Globe size={18} className="text-cyan-500"/>
             <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Endpoints</h2>
          </div>

          <div className="bg-[#0B1120] border border-slate-800 rounded-sm overflow-hidden">
             {/* Simple header for list */}
             <div className="bg-slate-900/50 px-4 py-2 border-b border-slate-800 flex justify-between">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Domain</span>
                <span className="text-[10px] font-mono text-slate-500 uppercase">Status</span>
             </div>

            {websites.length === 0 ? (
              <div className="p-8 text-center text-slate-500 font-mono text-xs">No active nodes</div>
            ) : (
              <div className="divide-y divide-slate-800/50">
                {websites.map((site) => (
                  <div key={site.domain} className="p-3 flex items-center justify-between hover:bg-slate-800/30 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-900 border border-slate-700 flex items-center justify-center rounded-sm">
                         <img src={site.icon} alt="" className="w-5 h-5 opacity-70 grayscale group-hover:grayscale-0 transition-all"/>
                      </div>
                      <div>
                        <h4 className="font-mono text-xs text-slate-300 group-hover:text-cyan-400 transition-colors">{site.cleanDomain}</h4>
                        <p className="text-[9px] text-slate-600 font-mono mt-[2px]">LAST_CHK: {timeAgo(site.lastCheck)}</p>
                      </div>
                    </div>
                    {/* Status LED */}
                    <div className={`w-2 h-2 rounded-full ${site.status === "200" || site.status === "UP" ? "bg-emerald-500 shadow-[0_0_5px_#10b981]" : "bg-red-500"}`}></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}