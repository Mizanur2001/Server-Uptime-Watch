// ======================================================
// SKELETON LOADERS — Matching the server-monitoring aesthetic
// ======================================================

// Base shimmer block
const Bone = ({ className = "" }) => (
  <div
    className={`bg-slate-800/60 rounded animate-pulse ${className}`}
  />
);

// ──────────────────────────────────────────────
// DASHBOARD: Server Card Skeleton
// ──────────────────────────────────────────────
export const DashboardServerCardSkeleton = () => (
  <div className="relative bg-[#0B1120] border border-slate-800 rounded-sm overflow-hidden">
    {/* Top strip */}
    <div className="h-1 w-full bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 opacity-50" />

    <div className="p-5 space-y-5">
      {/* Header row */}
      <div className="flex justify-between items-start border-b border-slate-800/50 pb-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Bone className="h-5 w-32" />
            <Bone className="h-2 w-2 rounded-full" />
          </div>
          <div className="flex gap-3">
            <Bone className="h-3 w-16" />
            <Bone className="h-3 w-20" />
          </div>
        </div>
        <div className="flex gap-1">
          <Bone className="w-1 h-3 rounded-sm" />
          <Bone className="w-1 h-3 rounded-sm" />
          <Bone className="w-1 h-3 rounded-sm" />
        </div>
      </div>

      {/* Body — gauge + bars */}
      <div className="flex gap-4 items-center">
        {/* Gauge placeholder */}
        <div className="w-1/3 flex justify-center border-r border-slate-800 border-dashed pr-2">
          <Bone className="w-[90px] h-[90px] rounded-full" />
        </div>
        {/* Bars placeholder */}
        <div className="w-2/3 space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <Bone className="h-3 w-16" />
              <Bone className="h-3 w-8" />
            </div>
            <Bone className="h-2 w-full" />
            <Bone className="h-2 w-12 ml-auto" />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <Bone className="h-3 w-16" />
              <Bone className="h-3 w-8" />
            </div>
            <Bone className="h-2 w-full" />
            <Bone className="h-2 w-12 ml-auto" />
          </div>
        </div>
      </div>
    </div>

    {/* Bottom vents */}
    <div className="h-2 w-full bg-[#050912] border-t border-slate-800 flex justify-center gap-[2px] items-center">
      {[...Array(20)].map((_, i) => (
        <div key={i} className="w-[2px] h-1 bg-slate-800 rounded-full" />
      ))}
    </div>
  </div>
);

// ──────────────────────────────────────────────
// DASHBOARD: Website Row Skeleton
// ──────────────────────────────────────────────
export const DashboardWebsiteRowSkeleton = () => (
  <div className="p-3 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <Bone className="w-8 h-8 rounded-sm" />
      <div className="space-y-1.5">
        <Bone className="h-3 w-28" />
        <Bone className="h-2 w-16" />
      </div>
    </div>
    <Bone className="w-2 h-2 rounded-full" />
  </div>
);

// ──────────────────────────────────────────────
// FULL DASHBOARD SKELETON
// ──────────────────────────────────────────────
export const DashboardSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    {/* LEFT — server cards */}
    <div className="lg:col-span-2 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Bone className="w-[18px] h-[18px] rounded" />
        <Bone className="h-4 w-28" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <DashboardServerCardSkeleton key={i} />
        ))}
      </div>
    </div>

    {/* RIGHT — website list */}
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Bone className="w-[18px] h-[18px] rounded" />
        <Bone className="h-4 w-24" />
      </div>
      <div className="bg-[#0B1120] border border-slate-800 rounded-sm overflow-hidden">
        <div className="bg-slate-900/50 px-4 py-2 border-b border-slate-800 flex justify-between">
          <Bone className="h-3 w-12" />
          <Bone className="h-3 w-12" />
        </div>
        <div className="divide-y divide-slate-800/50">
          {[...Array(5)].map((_, i) => (
            <DashboardWebsiteRowSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  </div>
);

// ──────────────────────────────────────────────
// SERVERS: ServerBlade Skeleton
// ──────────────────────────────────────────────
export const ServerBladeSkeleton = () => (
  <div className="relative bg-[#0B1120] border border-slate-800 rounded-lg overflow-hidden">
    {/* Header */}
    <div className="bg-[#111827] border-b border-slate-800 p-3 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <Bone className="w-2.5 h-2.5 rounded-full" />
        <div className="space-y-1.5">
          <Bone className="h-4 w-28" />
          <Bone className="h-2.5 w-20" />
        </div>
      </div>
      <div className="flex items-center gap-3 border-l border-slate-800 pl-3">
        <div className="flex gap-1.5">
          <Bone className="w-1.5 h-1.5 rounded-full" />
          <Bone className="w-1.5 h-1.5 rounded-full" />
          <Bone className="w-1.5 h-1.5 rounded-full" />
        </div>
        <Bone className="h-5 w-16 rounded" />
      </div>
    </div>

    {/* Body */}
    <div className="p-5 flex items-center gap-6">
      {/* CPU gauge */}
      <Bone className="flex-shrink-0 w-20 h-20 rounded-full" />

      {/* Divider */}
      <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-slate-700 to-transparent" />

      {/* Metrics */}
      <div className="flex-1 space-y-4">
        {/* Memory */}
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <Bone className="h-3 w-20" />
            <Bone className="h-3 w-10" />
          </div>
          <Bone className="h-1.5 w-full rounded-sm" />
          <Bone className="h-2.5 w-20 ml-auto" />
        </div>
        {/* Storage */}
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <Bone className="h-3 w-20" />
            <Bone className="h-3 w-10" />
          </div>
          <Bone className="h-1.5 w-full rounded-sm" />
          <Bone className="h-2.5 w-20 ml-auto" />
        </div>
      </div>
    </div>

    {/* Footer */}
    <div className="bg-[#050910] border-t border-slate-800 h-9 flex items-center justify-between px-4">
      <Bone className="h-3 w-16" />
      <Bone className="h-3 w-28" />
    </div>
  </div>
);

// ──────────────────────────────────────────────
// FULL SERVERS PAGE SKELETON
// ──────────────────────────────────────────────
export const ServersSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
    {[...Array(4)].map((_, i) => (
      <ServerBladeSkeleton key={i} />
    ))}
  </div>
);

// ──────────────────────────────────────────────
// WEBSITES: WebsiteCard Skeleton
// ──────────────────────────────────────────────
export const WebsiteCardSkeleton = () => (
  <div className="relative bg-[#0B1120] border border-slate-800 rounded-lg overflow-hidden flex flex-col">
    {/* Top bar */}
    <Bone className="h-[2px] w-full rounded-none" />

    {/* Header */}
    <div className="p-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Bone className="flex-shrink-0 w-10 h-10 rounded-md" />
        <div className="space-y-1.5 flex-1 min-w-0">
          <Bone className="h-4 w-3/4" />
          <Bone className="h-2.5 w-1/2" />
        </div>
      </div>
      <Bone className="flex-shrink-0 h-6 w-16 rounded" />
    </div>

    {/* Metrics grid */}
    <div className="px-4 py-3 grid grid-cols-2 gap-2 border-t border-slate-800/50 bg-[#0f1522]/50">
      <div className="space-y-1.5">
        <Bone className="h-2.5 w-14" />
        <Bone className="h-6 w-16" />
      </div>
      <div className="space-y-1.5 flex flex-col items-end">
        <Bone className="h-2.5 w-16" />
        <Bone className="h-3 w-14" />
      </div>
    </div>

    {/* Footer */}
    <div className="mt-auto px-4 py-2 bg-[#050910] border-t border-slate-800 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Bone className="w-[10px] h-[10px] rounded" />
        <Bone className="h-2.5 w-28" />
      </div>
      <div className="flex gap-[2px]">
        <Bone className="w-[2px] h-2" />
        <Bone className="w-[2px] h-2" />
        <Bone className="w-[2px] h-2" />
      </div>
    </div>
  </div>
);

// ──────────────────────────────────────────────
// FULL WEBSITES PAGE SKELETON
// ──────────────────────────────────────────────
export const WebsitesSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
    {[...Array(6)].map((_, i) => (
      <WebsiteCardSkeleton key={i} />
    ))}
  </div>
);
