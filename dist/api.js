"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPing = exports.getStats = void 0;
const util_1 = require("./util");
async function getStats() {
    const ping = await getPing();
    const res = await fetch("https://backend.xornet.cloud/status");
    const json = await res.json();
    return {
        ping_raw: ping,
        ping: `Ping: ${ping} ms`,
        uptime: `Uptime: ${(0, util_1.parseTime)(json.uptime)}`,
        cpu: `CPU: ${json.processor} %`,
        ram: `RAM: ${~~json.memory.used} MB / ${~~json.memory.total} MB`,
        shard: `Shard: ${json.shard}`,
    };
}
exports.getStats = getStats;
async function getPing() {
    const start = Date.now();
    const res = await fetch("https://backend.xornet.cloud/ping");
    return Date.now() - start;
}
exports.getPing = getPing;
//# sourceMappingURL=api.js.map