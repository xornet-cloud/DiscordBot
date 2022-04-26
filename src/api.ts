import { parseTime } from "./util";

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

export interface IBackendStatusParsed {
  ping: string;
  uptime: string;
  cpu: string;
  shard: string;
  ram: string;
  ping_raw: number;
}

export async function getStats(): Promise<IBackendStatusParsed> {
  const ping = await getPing();
  const res = await fetch("https://backend.xornet.cloud/status");
  const json = await res.json();
  return {
    ping_raw: ping,
    ping: `Ping: ${ping} ms`,
    uptime: `Uptime: ${parseTime(json.uptime)}`,
    cpu: `CPU: ${json.processor} %`,
    ram: `RAM: ${~~json.memory.used} MB / ${~~json.memory.total} MB`,
    shard: `Shard: ${json.shard}`,
  };
}

export async function getPing(): Promise<number> {
  const start = Date.now();
  const res = await fetch("https://backend.xornet.cloud/ping");
  return Date.now() - start;
}
