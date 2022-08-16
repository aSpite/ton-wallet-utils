/// <reference types="node" />
import { TLFunction } from "ton-tl";
import { LiteEngine } from "./engine";
export declare class LiteSingleEngine implements LiteEngine {
    #private;
    readonly host: string;
    readonly publicKey: Buffer;
    constructor(args: {
        host: string;
        publicKey: Buffer;
    });
    isClosed(): boolean;
    query<REQ, RES>(f: TLFunction<REQ, RES>, req: REQ, args: {
        timeout: number;
        awaitSeqno?: number;
    }): Promise<RES>;
    close(): void;
    private connect;
    private onConencted;
    private onReady;
    private onData;
    private onClosed;
}
