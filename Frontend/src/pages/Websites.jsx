import { useEffect, useState } from "react";
import AddWebsiteModal from "../components/AddWebsiteModal.jsx";
import { io } from "socket.io-client";
import { toast } from "sonner";
import { 
  Globe, Zap, Clock, Server as ServerIcon, 
  Plus, Search, ExternalLink, Activity, 
  AlertTriangle 
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
  if (diff < 5) return "JUST NOW";
  if (diff < 60) return `${diff}s AGO`;
  const min = Math.floor(diff / 60);
  if (min < 60) return `${min}m AGO`;
  return `${Math.floor(min / 60)}h AGO`;
};

// ==========================================
// 2. VISUAL COMPONENTS
// ==========================================

// --- The Monitor Card ---
const WebsiteCard = ({ site }) => {
  const isOnline = site.status === "200" || site.status === "UP";
  
  // Latency Color Logic
  let latencyColor = "text-slate-400";
  if (isOnline) {
     if (site.latency < 200) latencyColor = "text-emerald-400";
     else if (site.latency < 500) latencyColor = "text-amber-400";
     else latencyColor = "text-red-400";
  }

  return (
    <div className="group relative bg-[#0B1120] border border-slate-800 rounded-lg overflow-hidden transition-all duration-300 hover:border-cyan-500/30 hover:shadow-[0_0_20px_rgba(8,145,178,0.15)] flex flex-col">
      
      {/* Top Border Gradient */}
      <div className={`h-[2px] w-full ${isOnline ? "bg-gradient-to-r from-emerald-500 to-cyan-500" : "bg-red-600"}`}></div>
      
      {/* Header: Icon & Domain (FIXED LAYOUT) */}
      <div className="p-4 flex items-center justify-between gap-3">
        
        {/* Left Side: Icon + Text Container */}
        {/* min-w-0 is CRITICAL here for truncate to work in flex child */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          
          {/* Favicon - Shrink 0 so it never gets squashed */}
          <div className="flex-shrink-0 relative w-10 h-10 rounded-md bg-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden">
             <img 
               src={site.icon} 
               alt="" 
               className="w-6 h-6 object-contain opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
               onError={(e) => { e.target.style.display='none'; }} 
             />
             <div className="absolute inset-0 flex items-center justify-center -z-10">
                <Globe size={16} className="text-slate-600" />
             </div>
          </div>

          {/* Domain Name - Flex 1 and min-w-0 forces it to give up space */}
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-slate-100 font-mono tracking-tight group-hover:text-cyan-400 transition-colors truncate">
              {site.cleanDomain}
            </h3>
            <a 
              href={site.domain.startsWith('http') ? site.domain : `https://${site.domain}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors truncate"
            >
              {site.domain} <ExternalLink size={8} />
            </a>
          </div>
        </div>

        {/* Status Pill - Shrink 0 ensures it stays full size on the right */}
        <div className={`flex-shrink-0 flex items-center gap-1.5 px-2 py-1 rounded border text-[10px] font-bold font-mono tracking-wider ${
          isOnline 
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]" 
            : "bg-red-500/10 border-red-500/20 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.1)]"
        }`}>
           {isOnline ? (
             <>
               <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
               </span>
               ONLINE
             </>
           ) : (
             <>
               <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
               OFFLINE
             </>
           )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="px-4 py-3 grid grid-cols-2 gap-2 border-t border-slate-800/50 bg-[#0f1522]/50">
         
         {/* Latency */}
         <div className="flex flex-col gap-1">
            <span className="text-[9px] text-slate-500 font-mono uppercase flex items-center gap-1">
               <Zap size={10} className={latencyColor} /> Latency
            </span>
            <span className={`text-xl font-mono font-bold ${latencyColor}`}>
               {isOnline && site.latency ? `${site.latency}ms` : "--"}
            </span>
         </div>

         {/* Last Check */}
         <div className="flex flex-col gap-1 items-end">
            <span className="text-[9px] text-slate-500 font-mono uppercase flex items-center gap-1">
               <Clock size={10} /> Last Check
            </span>
            <span className="text-xs font-mono text-slate-300">
               {timeAgo(site.lastCheck)}
            </span>
         </div>
      </div>

      {/* Footer: Server Info */}
      <div className="mt-auto px-4 py-2 bg-[#050910] border-t border-slate-800 flex items-center justify-between">
         <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono min-w-0">
            <ServerIcon size={10} className="flex-shrink-0" />
            <span className="truncate">{site.server || "Unassigned Node"}</span>
         </div>
         {isOnline && (
            <div className="flex gap-[2px] flex-shrink-0">
               <div className="w-[2px] h-2 bg-emerald-500/50"></div>
               <div className="w-[2px] h-2 bg-emerald-500/30"></div>
               <div className="w-[2px] h-2 bg-emerald-500/10"></div>
            </div>
         )}
      </div>
    </div>
  );
};

// ==========================================
// 3. MAIN COMPONENT
// ==========================================
export default function Websites() {
  const [websites, setWebsites] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  // --- Mappers ---
  const mapWebsiteData = (data) => {
    return data.map((item) => {
      const domainClean = item.domain
        ?.replace("https://", "")
        ?.replace("http://", "")
        ?.split("/")[0] || "unknown";

      return {
        id: item._id || item.id,
        domain: item.domain,
        cleanDomain: domainClean,
        server: item.name && item.ip 
          ? `${item.name} (${item.ip})` 
          : item.serverId 
            ? `${item.serverId.name} (${item.serverId.ip})` 
            : "External / Unassigned",
        status: item.status,
        latency: item.latency,
        lastCheck: item.lastCheck,
        icon: `https://www.google.com/s2/favicons?domain=${domainClean}&sz=64`
      };
    });
  };

  const secureFetch = async (url) => {
    return fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  };

  const fetchWebsites = async () => {
    try {
      const res = await secureFetch(`${process.env.REACT_APP_API_URL}/api/v1/website`);
      const json = await res.json();

      if (json.error === "Invalid or expired token") {
        toast.error("Session expired");
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }
      if (json.status === "success") {
        setWebsites(mapWebsiteData(json.data));
      }
    } catch (error) {
      console.error("Failed to fetch websites:", error);
    }
  };

  useEffect(() => {
    fetchWebsites();
    if(socket) {
        socket.on("websites_update", (data) => setWebsites(mapWebsiteData(data)));
        return () => socket.off("websites_update");
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setWebsites((prev) => [...prev]), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- Filter ---
  const filteredSites = websites.filter(w => 
    w.domain.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Globe className="text-cyan-500" /> 
            <span>Endpoints</span>
          </h2>
          <p className="text-xs font-mono text-slate-500 mt-2 flex items-center gap-2">
            <Activity size={12} className="text-emerald-500" />
            <span>HTTP/HTTPS Monitoring Active. Tracking {websites.length} domains.</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
           {/* Search */}
           <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-500 group-focus-within:text-cyan-400" />
            </div>
            <input
              type="text"
              className="bg-[#0B1120] border border-slate-700 text-slate-200 text-sm rounded-md focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 block w-full pl-10 p-2.5 font-mono placeholder:text-slate-600"
              placeholder="SEARCH_URL..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold font-mono rounded-md transition-all shadow-[0_0_10px_rgba(8,145,178,0.4)] hover:shadow-[0_0_20px_rgba(8,145,178,0.6)]"
          >
            <Plus size={14} /> ADD_ENDPOINT
          </button>
        </div>
      </div>

      {/* Grid Content */}
      {filteredSites.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-lg text-slate-500 font-mono">
           <AlertTriangle size={32} className="mb-4 opacity-50"/>
           <span>NO_ENDPOINTS_FOUND</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
           {filteredSites.map((site, idx) => (
             <WebsiteCard key={site.id || idx} site={site} />
           ))}
        </div>
      )}

      {/* Modal */}
      <AddWebsiteModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchWebsites}
      />
    </div>
  );
}