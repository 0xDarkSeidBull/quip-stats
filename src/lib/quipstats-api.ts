// QuipStats live API client + types

export interface RawNode {
  a?: string; address?: string;
  m?: string; miner_id?: string;
  s?: string; status?: string;
  fs?: number; first_seen?: number;
  ls?: number; last_seen?: number;
  c?: number; num_cpus?: number;
  t?: string; node_type?: string;
  h?: string; public_host?: string;
  v?: string; quip_version?: string;
  ram?: number; memory_mb?: number;
  cpu_brand?: string;
  gpu_count?: number;
}

export interface QuipNode {
  uid: string;
  name: string;
  ip: string;
  type: "CPU" | "GPU" | "QPU";
  active: boolean;
  status: string;
  cpus: number;
  gpus: number;
  lastSeen: number;
  firstSeen: number;
  address: string;
  version: string;
  ram: number;
  cpuBrand: string;
  gpuCount: number;
}

const API_BASE = "https://api.republicstats.xyz/api/quip/telemetry/nodes";
const PAGE_SIZE = 500;
const CACHE_KEY = "qs_telem_v3";

export function normalizeNode(n: RawNode, idx: number): QuipNode {
  const status = n.status || n.s || "unknown";
  const addr = n.address || n.a || "";
  const minerId = n.miner_id || n.m || "";
  const host = n.public_host || n.h || (addr ? addr.split(":")[0] : "") || "";
  const cpus = n.num_cpus !== undefined ? n.num_cpus : (n.c || 0);
  const ntype = (n.node_type || n.t || "CPU") as QuipNode["type"];
  const name = minerId || addr || host || `node_${idx}`;
  const uid = addr || minerId || `${host}_${ntype}_${cpus}_${idx}`;
  return {
    uid,
    name,
    ip: host,
    type: ntype,
    active: status === "active",
    status,
    cpus,
    gpus: ntype === "GPU" ? 1 : 0,
    lastSeen: n.last_seen || n.ls || 0,
    firstSeen: n.first_seen || n.fs || 0,
    address: addr,
    version: n.quip_version || n.v || "",
    ram: n.memory_mb || n.ram || 0,
    cpuBrand: n.cpu_brand || "",
    gpuCount: n.gpu_count || 0,
  };
}

export function mergeNodes(oldArr: QuipNode[], freshArr: QuipNode[]): QuipNode[] {
  const map = new Map<string, QuipNode>();
  oldArr.forEach((n) => map.set(n.uid, n));
  freshArr.forEach((n) => map.set(n.uid, n));
  return Array.from(map.values());
}

export async function fetchAllNodes(): Promise<QuipNode[]> {
  const all: QuipNode[] = [];
  let page = 0;
  // safety cap
  while (page < 50) {
    const res = await fetch(`${API_BASE}?limit=${PAGE_SIZE}&page=${page}`);
    if (!res.ok) throw new Error(`API error ${res.status}`);
    const data = await res.json();
    const raw: RawNode[] = data.nodes || [];
    raw.forEach((n, i) => all.push(normalizeNode(n, page * PAGE_SIZE + i)));
    if (raw.length < PAGE_SIZE) break;
    page++;
  }
  return all;
}

export interface CachedNodes { nodes: QuipNode[]; ts: number; }

export function loadCache(): CachedNodes | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) as CachedNodes : null;
  } catch { return null; }
}

export function saveCache(nodes: QuipNode[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ nodes, ts: Date.now() }));
  } catch { /* ignore */ }
}

// ── Privacy helpers (mask IPs and wallet addresses in display) ──
export function maskIP(ip: string): string {
  if (!ip || ip === "—") return ip;
  const clean = ip.replace(/^::ffff:/i, "");
  const col = clean.lastIndexOf(":");
  const port = (col > 0 && /^\d+$/.test(clean.slice(col + 1))) ? clean.slice(col + 1) : null;
  const host = port ? clean.slice(0, col) : clean;
  const oct = host.split(".");
  if (oct.length === 4) {
    const m = `${oct[0]}.xx.xx.${oct[3]}`;
    return port ? `${m}:${port}` : m;
  }
  return ip;
}

export function maskName(name: string): string {
  if (!name) return name;
  let n = name.replace(/::ffff:(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})/gi, "::ffff:$1.xx.xx.$4");
  n = n.replace(/\b(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\b/g, "$1.xx.xx.$4");
  n = n.replace(/(0x[a-fA-F0-9]{6})[a-fA-F0-9]{30}([a-fA-F0-9]{4})/g, "$1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx$2");
  return n;
}

export function extractWallet(name: string): string | null {
  if (!name) return null;
  const m = name.match(/(0x[a-fA-F0-9]{40})/);
  return m ? m[1] : null;
}

export function formatResource(n: QuipNode): string {
  if (n.type === "GPU") return `${n.gpuCount || 1}GPU + ${n.cpus}C`;
  if (n.type === "QPU") return "QPU";
  return n.cpus > 0 ? `${n.cpus} cores` : "—";
}
