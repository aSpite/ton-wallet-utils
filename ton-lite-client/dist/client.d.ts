/// <reference types="node" />
import { Address, RawCurrencyCollection, RawStorageInfo, RawAccountStorage } from "ton";
import { LiteEngine } from "./engines/engine";
import { liteServer_blockHeader, liteServer_transactionId3, tonNode_blockIdExt } from "./schema";
declare type AllShardsResponse = {
    id: tonNode_blockIdExt;
    shards: {
        [key: string]: {
            [key: string]: number;
        };
    };
    raw: Buffer;
    proof: Buffer;
};
export declare class LiteClient {
    #private;
    readonly engine: LiteEngine;
    constructor(opts: {
        engine: LiteEngine;
        batchSize?: number | undefined | null;
    });
    sendMessage: (src: Buffer) => Promise<{
        status: number;
    }>;
    getMasterchainInfo: () => Promise<import("./schema").liteServer_masterchainInfo>;
    getMasterchainInfoExt: () => Promise<import("./schema").liteServer_masterchainInfoExt>;
    getCurrentTime: () => Promise<number>;
    getVersion: () => Promise<import("./schema").liteServer_version>;
    getConfig: (block: {
        seqno: number;
        shard: string;
        workchain: number;
        rootHash: Buffer;
        fileHash: Buffer;
    }) => Promise<import("ton").RawMasterChainStateExtra>;
    getAccountState: (src: Address, block: {
        seqno: number;
        shard: string;
        workchain: number;
        rootHash: Buffer;
        fileHash: Buffer;
    }, timeout?: number) => Promise<{
        state: {
            address: Address | null;
            storageStat: RawStorageInfo;
            storage: RawAccountStorage;
        } | null;
        lastTx: {
            lt: string;
            hash: Buffer;
        } | null;
        balance: RawCurrencyCollection;
        raw: Buffer;
        proof: Buffer;
        block: tonNode_blockIdExt;
        shardBlock: tonNode_blockIdExt;
        shardProof: Buffer;
    }>;
    getAccountTransaction: (src: Address, lt: string, block: {
        seqno: number;
        shard: string;
        workchain: number;
        rootHash: Buffer;
        fileHash: Buffer;
    }) => Promise<import("./schema").liteServer_transactionInfo>;
    getAccountTransactions: (src: Address, lt: string, hash: Buffer, count: number) => Promise<{
        ids: tonNode_blockIdExt[];
        transactions: Buffer;
    }>;
    runMethod: (src: Address, method: string, params: Buffer, block: {
        seqno: number;
        shard: string;
        workchain: number;
        rootHash: Buffer;
        fileHash: Buffer;
    }) => Promise<{
        exitCode: number;
        result: string | null;
        block: {
            seqno: number;
            shard: string;
            workchain: number;
            rootHash: Buffer;
            fileHash: Buffer;
        };
        shardBlock: {
            seqno: number;
            shard: string;
            workchain: number;
            rootHash: Buffer;
            fileHash: Buffer;
        };
    }>;
    lookupBlockByID: (block: {
        seqno: number;
        shard: string;
        workchain: number;
    }) => Promise<liteServer_blockHeader>;
    lookupBlockByUtime: (block: {
        shard: string;
        workchain: number;
        utime: number;
    }) => Promise<liteServer_blockHeader>;
    getBlockHeader: (block: {
        seqno: number;
        shard: string;
        workchain: number;
        rootHash: Buffer;
        fileHash: Buffer;
    }) => Promise<liteServer_blockHeader>;
    getAllShardsInfo: (block: {
        seqno: number;
        shard: string;
        workchain: number;
        rootHash: Buffer;
        fileHash: Buffer;
    }) => Promise<AllShardsResponse>;
    listBlockTransactions: (block: {
        seqno: number;
        shard: string;
        workchain: number;
        rootHash: Buffer;
        fileHash: Buffer;
    }, args?: {
        mode: number;
        count: number;
        after?: liteServer_transactionId3 | null | undefined;
        wantProof?: boolean | undefined;
    } | undefined) => Promise<import("./schema").liteServer_blockTransactions>;
    getFullBlock: (seqno: number) => Promise<{
        shards: {
            rootHash: Buffer;
            fileHash: Buffer;
            transactions: {
                hash: Buffer;
                lt: string;
                account: Buffer;
            }[];
            workchain: number;
            seqno: number;
            shard: string;
        }[];
    }>;
}
export {};
