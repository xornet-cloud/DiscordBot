export interface IBackendStatus {
  memory: {
    used: number;
    total: number;
  };
  processor: number;
  uptime: number;
  shard: string;
  ping: number;
}

export async function getStats(): Promise<IBackendStatus> {
  const ping = await getPing();
  const res = await fetch("https://backend.xornet.cloud/status");
  const json = await res.json();
  return { ...json, ping };
}

export async function getPing(): Promise<number> {
  const start = Date.now();
  const res = await fetch("https://backend.xornet.cloud/ping");
  return Date.now() - start;
}
