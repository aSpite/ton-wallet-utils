"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _LiteClient_blockLockup, _LiteClient_shardsLockup, _LiteClient_blockHeader;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiteClient = void 0;
const bn_js_1 = __importDefault(require("bn.js"));
const ton_1 = require("ton");
const parse_1 = require("ton/dist/block/parse");
const parseShards_1 = require("./parser/parseShards");
const schema_1 = require("./schema");
const dataloader_1 = __importDefault(require("dataloader"));
const crc16_1 = require("./utils/crc16");
const ZERO = new bn_js_1.default(0);
//
// Ops
//
const lookupBlockByID = async (engine, props) => {
    return await engine.query(schema_1.Functions.liteServer_lookupBlock, {
        kind: 'liteServer.lookupBlock',
        mode: 1,
        id: {
            kind: 'tonNode.blockId',
            seqno: props.seqno,
            shard: props.shard,
            workchain: props.workchain
        },
        lt: null,
        utime: null
    }, { timeout: 5000 });
};
const lookupBlockByUtime = async (engine, props) => {
    return await engine.query(schema_1.Functions.liteServer_lookupBlock, {
        kind: 'liteServer.lookupBlock',
        mode: 4,
        id: {
            kind: 'tonNode.blockId',
            seqno: 0,
            shard: props.shard,
            workchain: props.workchain
        },
        lt: null,
        utime: props.utime
    }, { timeout: 5000 });
};
const getAllShardsInfo = async (engine, props) => {
    let res = (await engine.query(schema_1.Functions.liteServer_getAllShardsInfo, { kind: 'liteServer.getAllShardsInfo', id: props }, { timeout: 5000 }));
    let parsed = (0, parseShards_1.parseShards)(ton_1.Cell.fromBoc(res.data)[0].beginParse());
    let shards = {};
    for (let p of parsed) {
        shards[p[0]] = {};
        for (let p2 of p[1]) {
            shards[p[0]][p2[0]] = p2[1];
        }
    }
    return {
        id: res.id,
        shards,
        raw: res.data,
        proof: res.proof
    };
};
const getBlockHeader = async (engine, props) => {
    return await engine.query(schema_1.Functions.liteServer_getBlockHeader, {
        kind: 'liteServer.getBlockHeader',
        mode: 1,
        id: {
            kind: 'tonNode.blockIdExt',
            seqno: props.seqno,
            shard: props.shard,
            workchain: props.workchain,
            rootHash: props.rootHash,
            fileHash: props.fileHash
        }
    }, { timeout: 5000 });
};
class LiteClient {
    constructor(opts) {
        _LiteClient_blockLockup.set(this, void 0);
        _LiteClient_shardsLockup.set(this, void 0);
        _LiteClient_blockHeader.set(this, void 0);
        //
        // Sending
        //
        this.sendMessage = async (src) => {
            let res = await this.engine.query(schema_1.Functions.liteServer_sendMessage, { kind: 'liteServer.sendMessage', body: src }, { timeout: 5000 });
            return {
                status: res.status
            };
        };
        //
        // State
        //
        this.getMasterchainInfo = async () => {
            return this.engine.query(schema_1.Functions.liteServer_getMasterchainInfo, { kind: 'liteServer.masterchainInfo' }, { timeout: 5000 });
        };
        this.getMasterchainInfoExt = async () => {
            return this.engine.query(schema_1.Functions.liteServer_getMasterchainInfoExt, { kind: 'liteServer.masterchainInfoExt', mode: 0 }, { timeout: 5000 });
        };
        this.getCurrentTime = async () => {
            return (await this.engine.query(schema_1.Functions.liteServer_getTime, { kind: 'liteServer.getTime' }, { timeout: 5000 })).now;
        };
        this.getVersion = async () => {
            return (await this.engine.query(schema_1.Functions.liteServer_getVersion, { kind: 'liteServer.getVersion' }, { timeout: 5000 }));
        };
        this.getConfig = async (block) => {
            let res = await this.engine.query(schema_1.Functions.liteServer_getConfigAll, {
                kind: 'liteServer.getConfigAll',
                id: {
                    kind: 'tonNode.blockIdExt',
                    seqno: block.seqno,
                    shard: block.shard,
                    workchain: block.workchain,
                    fileHash: block.fileHash,
                    rootHash: block.rootHash
                },
                mode: 0
            }, { timeout: 5000 });
            const configProof = ton_1.Cell.fromBoc(res.configProof)[0];
            const configCell = configProof.refs[0];
            const cs = configCell.beginParse();
            let shardState = (0, parse_1.parseShardStateUnsplit)(cs);
            if (!shardState.extras) {
                throw Error('Invalid response');
            }
            return shardState.extras;
        };
        //
        // Account
        //
        this.getAccountState = async (src, block, timeout = 5000) => {
            let res = (await this.engine.query(schema_1.Functions.liteServer_getAccountState, {
                kind: 'liteServer.getAccountState',
                id: {
                    kind: 'tonNode.blockIdExt',
                    seqno: block.seqno,
                    shard: block.shard,
                    workchain: block.workchain,
                    fileHash: block.fileHash,
                    rootHash: block.rootHash
                },
                account: {
                    kind: 'liteServer.accountId',
                    workchain: src.workChain,
                    id: src.hash
                }
            }, { timeout }));
            let account = null;
            let balance = { coins: ZERO, extraCurrencies: null };
            let lastTx = null;
            if (res.state.length > 0) {
                account = (0, ton_1.parseAccount)(ton_1.Cell.fromBoc(res.state)[0].beginParse());
                if (account) {
                    balance = account.storage.balance;
                    let shardState = (0, parse_1.parseShardStateUnsplit)(ton_1.Cell.fromBoc(res.proof)[1].refs[0].beginParse());
                    let hashId = new bn_js_1.default(src.hash.toString('hex'), 'hex').toString(10);
                    let pstate = shardState.accounts.get(hashId);
                    if (pstate) {
                        lastTx = { hash: pstate.shardAccount.lastTransHash, lt: pstate.shardAccount.lastTransLt.toString(10) };
                    }
                }
            }
            return {
                state: account,
                lastTx,
                balance,
                raw: res.state,
                proof: res.proof,
                block: res.id,
                shardBlock: res.shardblk,
                shardProof: res.shardProof
            };
        };
        this.getAccountTransaction = async (src, lt, block) => {
            return await this.engine.query(schema_1.Functions.liteServer_getOneTransaction, {
                kind: 'liteServer.getOneTransaction',
                id: block,
                account: {
                    kind: 'liteServer.accountId',
                    workchain: src.workChain,
                    id: src.hash
                },
                lt: lt
            }, { timeout: 5000 });
        };
        this.getAccountTransactions = async (src, lt, hash, count) => {
            let loaded = await this.engine.query(schema_1.Functions.liteServer_getTransactions, {
                kind: 'liteServer.getTransactions',
                count,
                account: {
                    kind: 'liteServer.accountId',
                    workchain: src.workChain,
                    id: src.hash
                },
                lt: lt,
                hash: hash
            }, { timeout: 5000 });
            return {
                ids: loaded.ids,
                transactions: loaded.transactions
            };
        };
        this.runMethod = async (src, method, params, block) => {
            let res = await this.engine.query(schema_1.Functions.liteServer_runSmcMethod, {
                kind: 'liteServer.runSmcMethod',
                mode: 4,
                id: {
                    kind: 'tonNode.blockIdExt',
                    seqno: block.seqno,
                    shard: block.shard,
                    workchain: block.workchain,
                    rootHash: block.rootHash,
                    fileHash: block.fileHash
                },
                account: {
                    kind: 'liteServer.accountId',
                    workchain: src.workChain,
                    id: src.hash
                },
                methodId: (((0, crc16_1.crc16)(method) & 0xffff) | 0x10000) + '',
                params
            }, { timeout: 5000 });
            return {
                exitCode: res.exitCode,
                result: res.result ? res.result.toString('base64') : null,
                block: {
                    seqno: res.id.seqno,
                    shard: res.id.shard,
                    workchain: res.id.workchain,
                    rootHash: res.id.rootHash,
                    fileHash: res.id.fileHash
                },
                shardBlock: {
                    seqno: res.shardblk.seqno,
                    shard: res.shardblk.shard,
                    workchain: res.shardblk.workchain,
                    rootHash: res.shardblk.rootHash,
                    fileHash: res.shardblk.fileHash
                },
            };
        };
        //
        // Block
        //
        this.lookupBlockByID = async (block) => {
            return await __classPrivateFieldGet(this, _LiteClient_blockLockup, "f").load({ ...block, mode: 'id' });
        };
        this.lookupBlockByUtime = async (block) => {
            return await __classPrivateFieldGet(this, _LiteClient_blockLockup, "f").load({ ...block, mode: 'utime' });
        };
        this.getBlockHeader = async (block) => {
            return __classPrivateFieldGet(this, _LiteClient_blockHeader, "f").load(block);
        };
        this.getAllShardsInfo = async (block) => {
            return __classPrivateFieldGet(this, _LiteClient_shardsLockup, "f").load(block);
        };
        this.listBlockTransactions = async (block, args) => {
            let mode = args?.mode || 1 + 2 + 4;
            let count = args?.count || 100;
            let after = args && args.after ? args.after : null;
            return await this.engine.query(schema_1.Functions.liteServer_listBlockTransactions, {
                kind: 'liteServer.listBlockTransactions',
                id: {
                    kind: 'tonNode.blockIdExt',
                    seqno: block.seqno,
                    shard: block.shard,
                    workchain: block.workchain,
                    rootHash: block.rootHash,
                    fileHash: block.fileHash
                },
                mode,
                count,
                reverseOrder: null,
                after,
                wantProof: null
            }, { timeout: 5000 });
        };
        this.getFullBlock = async (seqno) => {
            // MC Blocks
            let [mcBlockId, mcBlockPrevId] = await Promise.all([
                this.lookupBlockByID({ workchain: -1, shard: '-9223372036854775808', seqno: seqno }),
                this.lookupBlockByID({ workchain: -1, shard: '-9223372036854775808', seqno: seqno - 1 })
            ]);
            // Shards
            let [mcShards, mcShardsPrev] = await Promise.all([
                this.getAllShardsInfo(mcBlockId.id),
                this.getAllShardsInfo(mcBlockPrevId.id)
            ]);
            // Extract shards
            let shards = [];
            shards.push({ seqno, workchain: -1, shard: '-9223372036854775808' });
            // Extract shards
            for (let wcs in mcShards.shards) {
                let wc = parseInt(wcs, 10);
                let psh = mcShardsPrev.shards[wcs] || {};
                for (let shs in mcShards.shards[wcs]) {
                    let seqno = mcShards.shards[wcs][shs];
                    let prevSeqno = psh[shs] || seqno;
                    for (let s = prevSeqno + 1; s <= seqno; s++) {
                        shards.push({ seqno: s, workchain: wc, shard: shs });
                    }
                }
            }
            // Fetch transactions and blocks
            let shards2 = await Promise.all(shards.map(async (shard) => {
                let blockId = await this.lookupBlockByID(shard);
                let transactions = [];
                let after = null;
                while (true) {
                    let tr = await this.listBlockTransactions(blockId.id, {
                        count: 128,
                        mode: 1 + 2 + 4 + (after ? 128 : 0),
                        after
                    });
                    for (let t of tr.ids) {
                        transactions.push(t);
                    }
                    if (!tr.incomplete) {
                        break;
                    }
                    after = { kind: 'liteServer.transactionId3', account: tr.ids[tr.ids.length - 1].account, lt: tr.ids[tr.ids.length - 1].lt };
                }
                let mapped = transactions.map((t) => ({ hash: t.hash, lt: t.lt, account: t.account }));
                return {
                    ...shard,
                    rootHash: blockId.id.rootHash,
                    fileHash: blockId.id.fileHash,
                    transactions: mapped
                };
            }));
            return {
                shards: shards2
            };
        };
        this.engine = opts.engine;
        let batchSize = typeof opts.batchSize === 'number' ? opts.batchSize : 100;
        __classPrivateFieldSet(this, _LiteClient_blockLockup, new dataloader_1.default(async (s) => {
            return await Promise.all(s.map((v) => {
                if (v.mode === 'utime') {
                    return lookupBlockByUtime(this.engine, v);
                }
                return lookupBlockByID(this.engine, v);
            }));
        }, { maxBatchSize: batchSize, cacheKeyFn: (s) => {
                if (s.mode === 'id') {
                    return s.workchain + '::' + s.shard + '::' + s.seqno;
                }
                else {
                    return s.workchain + '::' + s.shard + '::utime-' + s.utime;
                }
            } }), "f");
        __classPrivateFieldSet(this, _LiteClient_blockHeader, new dataloader_1.default(async (s) => {
            return await Promise.all(s.map((v) => getBlockHeader(this.engine, v)));
        }, { maxBatchSize: batchSize, cacheKeyFn: (s) => s.workchain + '::' + s.shard + '::' + s.seqno }), "f");
        __classPrivateFieldSet(this, _LiteClient_shardsLockup, new dataloader_1.default(async (s) => {
            return await Promise.all(s.map((v) => getAllShardsInfo(this.engine, v)));
        }, { maxBatchSize: batchSize, cacheKeyFn: (s) => s.workchain + '::' + s.shard + '::' + s.seqno }), "f");
    }
}
exports.LiteClient = LiteClient;
_LiteClient_blockLockup = new WeakMap(), _LiteClient_shardsLockup = new WeakMap(), _LiteClient_blockHeader = new WeakMap();
