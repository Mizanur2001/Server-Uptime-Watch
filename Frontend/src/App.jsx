import { Routes, Route, Navigate, NavLink, useLocation } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import Dashboard from "./pages/Dashboard.jsx";
import Servers from "./pages/Servers.jsx";
import Websites from "./pages/Websites.jsx";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Server,
  Globe,
  Menu,
  X,
  Terminal,
  Cpu,
  ShieldCheck,
} from "lucide-react";
import "./App.css";

export default function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === "/login";
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="h-screen w-full flex bg-[#020617] text-slate-200 font-sans selection:bg-cyan-500/30 selection:text-cyan-100 relative overflow-hidden">
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <Toaster richColors theme="dark" />

      {!isAuthPage && <Sidebar className="hidden md:flex z-10" />}

      <main className="flex-1 flex flex-col relative z-10 h-full overflow-hidden">
        {!isAuthPage && (
          <header className="h-16 border-b border-slate-800 bg-[#020617]/80 backdrop-blur-md flex items-center justify-between px-4 md:px-6 flex-shrink-0">
            <div className="flex items-center gap-3">
              <button
                className="md:hidden p-2 rounded-md hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition-colors"
                aria-label="Open menu"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={20} />
              </button>

              <div className="hidden sm:flex items-center gap-2 font-mono text-sm text-slate-500">
                <Terminal size={14} className="text-cyan-500" />
                <span className="text-slate-600">~/admin</span>
                <span className="text-slate-400">/</span>
                <span className="text-cyan-400 font-bold uppercase tracking-wider">
                  {location.pathname === "/"
                    ? "dashboard"
                    : location.pathname.replace("/", "")}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="hidden md:block text-slate-600">
                UPTIME: <span className="text-slate-400">99.9%</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-emerald-400 font-bold tracking-wide">
                  SYSTEM ONLINE
                </span>
              </div>
            </div>
          </header>
        )}

        {!isAuthPage && isSidebarOpen && (
          <MobileSidebarDrawer onClose={() => setSidebarOpen(false)} />
        )}

        <section className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/servers"
              element={
                <ProtectedRoute>
                  <Servers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/websites"
              element={
                <ProtectedRoute>
                  <Websites />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </section>
      </main>
    </div>
  );
}

function Sidebar({ className = "" }) {
  const version = import.meta.env.REACT_APP_VERSION;

  return (
    <aside
      className={`${className} w-72 h-full border-r border-slate-800 bg-[#0B1120] flex flex-col relative`}
    >
      <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-slate-700 shadow-inner"></div>
      <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-slate-700 shadow-inner"></div>
      <div className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-slate-700 shadow-inner"></div>
      <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-slate-700 shadow-inner"></div>

      <div className="px-6 py-8 border-b border-slate-800/60 bg-gradient-to-b from-slate-900 to-transparent flex-shrink-0">
        <h1 className="text-2xl font-bold tracking-tighter text-white flex items-center gap-2">
          <Cpu className="text-cyan-500" />
          <span>
            Uptime<span className="text-cyan-500">Watch</span>
          </span>
        </h1>
        <p className="text-[10px] font-mono text-slate-500 mt-2 uppercase tracking-widest pl-1">
          Internal Status Dashboard
        </p>
      </div>

      <nav className="mt-8 px-4 space-y-2 flex-1 overflow-y-auto">
        <SidebarLink
          to="/"
          label="Overview"
          icon={<LayoutDashboard size={18} />}
        />
        <SidebarLink
          to="/servers"
          label="Server Nodes"
          icon={<Server size={18} />}
        />
        <SidebarLink
          to="/websites"
          label="Endpoints"
          icon={<Globe size={18} />}
        />
      </nav>

      <footer className="mt-auto p-6 border-t border-slate-800 bg-[#050912] flex-shrink-0">
        <div className="flex gap-1 mb-4 opacity-30 justify-center">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="w-1 h-3 bg-slate-500 rounded-full"></div>
          ))}
        </div>

        <div className="text-[10px] font-mono text-slate-500 space-y-2 border border-slate-800 p-3 rounded bg-slate-900/50">
          <div className="flex justify-between border-b border-slate-800 pb-1 mb-1">
            <span>Version:</span>
            <span className="text-slate-300">{version}</span>
          </div>
          <div className="flex justify-between">
            <span>Developed by:</span>
            <span className="text-cyan-400 hover:underline cursor-pointer">
              Mizanur.R
            </span>
          </div>
          <div className="flex justify-between items-center text-xs mt-2 pt-2 border-t border-slate-800 text-emerald-500">
            <span className="flex items-center gap-1">
              <ShieldCheck size={10} /> SECURE
            </span>
          </div>
        </div>
      </footer>
    </aside>
  );
}

function MobileSidebarDrawer({ onClose }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const version = import.meta.env.REACT_APP_VERSION;

  return (
    <div className="fixed inset-0 z-50 flex font-sans">
      <button
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <aside className="relative w-72 max-w-[85vw] h-full border-r border-slate-800 bg-[#0B1120] flex flex-col shadow-2xl shadow-cyan-900/20">
        <div className="px-6 py-6 border-b border-slate-800 flex items-center justify-between bg-[#050912] flex-shrink-0">
          <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
            <Cpu className="text-cyan-500" size={20} />
            <span>
              Uptime<span className="text-cyan-500">Watch</span>
            </span>
          </h1>
          <button
            className="p-1 rounded text-slate-400 hover:text-white"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="mt-6 px-4 space-y-2 flex-1 overflow-y-auto">
          <SidebarLink
            to="/"
            label="Overview"
            icon={<LayoutDashboard size={18} />}
            onClick={onClose}
          />
          <SidebarLink
            to="/servers"
            label="Server Nodes"
            icon={<Server size={18} />}
            onClick={onClose}
          />
          <SidebarLink
            to="/websites"
            label="Endpoints"
            icon={<Globe size={18} />}
            onClick={onClose}
          />
        </nav>

        <footer className="mt-auto p-6 border-t border-slate-800 text-center font-mono text-[10px] text-slate-500 flex-shrink-0">
          <p>Version: {version}</p>
          <p className="mt-1">Developed by: Mizanur Rahaman</p>
        </footer>
      </aside>
    </div>
  );
}

function SidebarLink({ to, label, icon, onClick }) {
  return (
    <NavLink
      to={to}
      end
      onClick={onClick}
      className={({ isActive }) =>
        [
          "group flex items-center gap-3 px-4 py-3 rounded-md text-sm font-mono transition-all duration-200 border",
          isActive
            ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)] translate-x-1"
            : "text-slate-400 border-transparent hover:bg-slate-800/50 hover:text-slate-200 hover:border-slate-700",
        ].join(" ")
      }
    >
      {({ isActive }) => (
        <>
          <span className="opacity-70 group-hover:opacity-100 transition-opacity">
            {icon}
          </span>
          <span className="tracking-wide">{label}</span>

          {isActive && (
            <div className="ml-auto opacity-100">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_5px_#22d3ee]"></div>
            </div>
          )}
        </>
      )}
    </NavLink>
  );
}
