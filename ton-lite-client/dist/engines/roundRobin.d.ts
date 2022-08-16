import { TLFunction } from "ton-tl";
import { LiteEngine } from "./engine";
export declare class LiteRoundRobinEngine implements LiteEngine {
    #private;
    readonly engines: LiteEngine[];
    constructor(engines: LiteEngine[]);
    query<REQ, RES>(f: TLFunction<REQ, RES>, req: REQ, args: {
        timeout: number;
        awaitSeqno?: number;
    }): Promise<RES>;
    close(): void;
    isClosed(): boolean;
}
