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
export declare function getStats(): Promise<IBackendStatusParsed>;
export declare function getPing(): Promise<number>;
