import { Routes, Route, Navigate, NavLink, useLocation } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import Dashboard from "./pages/Dashboard.jsx";
import Servers from "./pages/Servers.jsx";
import Websites from "./pages/Websites.jsx";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === "/login";

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-50">
      <Toaster richColors />

      {/* Render sidebar ONLY if NOT on login page */}
      {!isAuthPage && <Sidebar />}

      <main className="flex-1 flex flex-col">

        {/* Top bar — only show after login */}
        {!isAuthPage && (
          <header className="h-14 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-950/40 backdrop-blur">
            <h2 className="text-sm font-medium text-slate-300">
              Monitoring Admin Panel
            </h2>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>System online</span>
            </div>
          </header>
        )}

        {/* Main routes */}
        <section className="flex-1 p-6 overflow-y-auto">
          <Routes>

            {/* Public Route */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
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

            {/* Redirect all others */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </section>

      </main>
    </div>
  );
}

function Sidebar() {
  const version = process.env.REACT_APP_VERSION;
  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/60 backdrop-blur-md flex flex-col">
      {/* Header */}
      <div className="px-4 py-5 border-b border-slate-800">
        <h1 className="text-xl font-bold tracking-tight">
          Uptime<span className="text-emerald-400">Monitor</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">Internal status dashboard</p>
      </div>

      {/* Navigation */}
      <nav className="mt-4 px-2 space-y-1 flex-1">
        <SidebarLink to="/" label="Dashboard" />
        <SidebarLink to="/servers" label="Servers" />
        <SidebarLink to="/websites" label="Websites" />
      </nav>

      {/* Footer */}
      <footer className="mt-auto px-4 py-5 border-t border-slate-800 text-center">
        <div className="text-[11px] text-slate-500 space-y-1">
          <p className="tracking-wide">
            Version <span className="text-slate-300 font-semibold">{version}</span>
          </p>

          <p>
            Designed & Developed by{" "}
            <span className="text-emerald-400 font-semibold hover:text-emerald-300 transition">
              Mizanur Rahaman
            </span>
          </p>
        </div>
      </footer>

    </aside>
  );
}


function SidebarLink({ to, label }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        [
          "flex items-center px-3 py-2 rounded-lg text-sm transition",
          isActive
            ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40"
            : "text-slate-300 hover:bg-slate-800/60 hover:text-slate-50",
        ].join(" ")
      }
    >
      <span>{label}</span>
    </NavLink>
  );
}