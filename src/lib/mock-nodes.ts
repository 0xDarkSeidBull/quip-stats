export type NodeType = "CPU" | "GPU" | "QPU";
export type NodeStatus = "online" | "offline";

export interface NodeRecord {
  id: string;
  name: string;
  ip: string;
  type: NodeType;
  status: NodeStatus;
  resources: string;
  ram?: string;
  lastSeen: string;
  firstSeen: string;
}

const mask = (n: number) => `${n}.xx.xx.${Math.floor(Math.random() * 250) + 1}`;

const seedIps = [114, 167, 14, 24, 42, 89, 94, 65, 188, 201, 33, 77, 152, 9, 218, 46];

export const mockNodes: NodeRecord[] = Array.from({ length: 42 }).map((_, i) => {
  const ipBase = seedIps[i % seedIps.length];
  const ip = `${mask(ipBase)}:${50000 + Math.floor(Math.random() * 15000)}`;
  const typeRoll = Math.random();
  const type: NodeType = typeRoll > 0.92 ? "QPU" : typeRoll > 0.55 ? "GPU" : "CPU";
  const status: NodeStatus = Math.random() > 0.4 ? "online" : "offline";
  return {
    id: `node-${i}`,
    name: `::ffff:${ip}`,
    ip,
    type,
    status,
    resources: status === "online" ? `${Math.floor(Math.random() * 28) + 4} cores` : "—",
    ram: status === "online" ? `${[8, 16, 32, 64][Math.floor(Math.random() * 4)]} GB` : "—",
    lastSeen: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toLocaleTimeString("en-GB"),
    firstSeen: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000).toLocaleDateString("en-GB"),
  };
});

export const stats = {
  live: 96,
  everSeen: 3742,
  activeNow: 226,
  cpuActive: 209,
  gpuActive: 17,
  qpuActive: 0,
  versionMismatch: 3323,
  lost: 187,
};
