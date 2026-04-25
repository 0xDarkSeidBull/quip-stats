import { useMemo, useState } from "react";
import { StatCard } from "@/components/StatCard";
import { NodeDetailModal } from "@/components/NodeDetailModal";
import { mockNodes, stats, type NodeRecord } from "@/lib/mock-nodes";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

type Filter = "all" | "active" | "gpu" | "cpu" | "offline";
type Tab = "nodes" | "analytics" | "sybil";

const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "gpu", label: "GPU" },
  { id: "cpu", label: "CPU" },
  { id: "offline", label: "Offline" },
];

const tabs: { id: Tab; label: string }[] = [
  { id: "nodes", label: "Live Nodes" },
  { id: "analytics", label: "Analytics" },
  { id: "sybil", label: "Sybil Detector" },
];

export default function Index() {
  const [tab, setTab] = useState<Tab>("nodes");
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<NodeRecord | null>(null);

  const filtered = useMemo(() => {
    return mockNodes.filter((n) => {
      if (query && !n.name.toLowerCase().includes(query.toLowerCase())) return false;
      switch (filter) {
        case "active": return n.status === "online";
        case "offline": return n.status === "offline";
        case "gpu": return n.type === "GPU";
        case "cpu": return n.type === "CPU";
        default: return true;
      }
    });
  }, [filter, query]);

  const now = new Date().toLocaleTimeString("en-GB");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-8 py-4">
          <div className="flex items-baseline gap-3">
            <h1 className="text-[15px] font-semibold tracking-tight text-foreground">
              QuipStats
            </h1>
            <span className="text-xs font-medium text-muted-foreground">Network</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
            </span>
            <span className="font-mono">Updated {now}</span>
          </div>
        </div>

        {/* Tabs */}
        <nav className="mx-auto flex max-w-[1280px] items-center gap-1 px-8">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "relative px-4 py-3 text-[13px] font-medium transition-colors",
                tab === t.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
              {tab === t.id && (
                <span className="absolute inset-x-3 -bottom-px h-px bg-foreground" />
              )}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-[1280px] px-8 py-8">
        {tab === "nodes" && (
          <>
            {/* Summary line */}
            <div className="mb-6 flex items-center gap-6 text-[13px]">
              <span className="text-muted-foreground">
                Live <span className="font-mono font-medium text-foreground">{stats.live}</span> nodes
              </span>
              <span className="h-4 w-px bg-border" />
              <span className="text-muted-foreground">
                Ever seen <span className="font-mono font-medium text-foreground">{stats.everSeen.toLocaleString()}</span>
              </span>
            </div>

            {/* Stat grid */}
            <section className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8">
              <StatCard label="Live Nodes" value={stats.live} hint="API snapshot" tone="success" />
              <StatCard label="Ever Seen" value={stats.everSeen.toLocaleString()} hint="all-time" />
              <StatCard label="Active Now" value={stats.activeNow} hint="from telemetry" />
              <StatCard label="CPU Active" value={stats.cpuActive} hint="CPU nodes" tone="info" />
              <StatCard label="GPU Active" value={stats.gpuActive} hint="GPU nodes" tone="success" />
              <StatCard label="QPU Active" value={stats.qpuActive} hint="quantum" tone="muted" />
              <StatCard label="Ver. Mismatch" value={stats.versionMismatch.toLocaleString()} hint="need update" tone="warning" />
              <StatCard label="Lost" value={stats.lost} hint="disconnected" tone="destructive" />
            </section>

            {/* Controls */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search node name or IP"
                  className="w-full rounded-lg border border-border bg-surface py-2.5 pl-9 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:border-foreground/30 focus:outline-none focus:ring-0"
                />
              </div>
              <div className="flex gap-1 rounded-lg border border-border bg-surface p-1">
                {filters.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                      filter === f.id
                        ? "bg-accent text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Section title */}
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                {filter === "all" ? "All nodes" : filters.find((f) => f.id === filter)?.label + " nodes"}
                <span className="ml-2 font-mono text-foreground">{filtered.length}</span>
              </h2>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-border bg-surface">
              <div className="grid grid-cols-[48px_minmax(0,1fr)_80px_110px_90px_180px] gap-3 border-b border-border px-5 py-3 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                <div>#</div>
                <div>Node</div>
                <div>Type</div>
                <div>Resources</div>
                <div>Status</div>
                <div className="text-right">IP</div>
              </div>
              {filtered.length === 0 ? (
                <div className="px-5 py-12 text-center text-sm text-muted-foreground">
                  No nodes match your filters.
                </div>
              ) : (
                filtered.map((n, i) => (
                  <button
                    key={n.id}
                    onClick={() => setSelected(n)}
                    className="group grid w-full grid-cols-[48px_minmax(0,1fr)_80px_110px_90px_180px] items-center gap-3 border-b border-border/60 px-5 py-3 text-left transition-colors last:border-b-0 hover:bg-accent/40"
                  >
                    <div className="font-mono text-[11px] text-muted-foreground">{i + 1}</div>
                    <div className="truncate font-mono text-[12.5px] font-medium text-foreground">
                      {n.name}
                    </div>
                    <div>
                      <span
                        className={cn(
                          "rounded border px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider",
                          n.type === "GPU" && "border-success/30 text-success",
                          n.type === "CPU" && "border-info/30 text-info",
                          n.type === "QPU" && "border-foreground/20 text-foreground"
                        )}
                      >
                        {n.type}
                      </span>
                    </div>
                    <div className="font-mono text-[12px] text-muted-foreground">{n.resources}</div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          n.status === "online" ? "bg-success" : "bg-destructive"
                        )}
                      />
                      <span className="text-[11px] capitalize text-muted-foreground">{n.status}</span>
                    </div>
                    <div className="text-right font-mono text-[11.5px] text-muted-foreground">
                      {n.ip}
                    </div>
                  </button>
                ))
              )}
            </div>
          </>
        )}

        {tab === "analytics" && (
          <div className="rounded-xl border border-border bg-surface p-12 text-center text-sm text-muted-foreground">
            Analytics view — connect your data source to populate charts.
          </div>
        )}
        {tab === "sybil" && (
          <div className="rounded-xl border border-border bg-surface p-12 text-center text-sm text-muted-foreground">
            Sybil Detector — clustering and threat analysis goes here.
          </div>
        )}
      </main>

      <footer className="mx-auto max-w-[1280px] border-t border-border px-8 py-6 text-center text-[11px] text-muted-foreground">
        QuipStats · Live network telemetry
      </footer>

      <NodeDetailModal node={selected} open={!!selected} onClose={() => setSelected(null)} />
    </div>
  );
}
