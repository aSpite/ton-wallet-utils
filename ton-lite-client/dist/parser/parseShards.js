"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseShards = void 0;
const bn_js_1 = __importDefault(require("bn.js"));
const ton_1 = require("ton");
const ton_tl_1 = require("ton-tl");
// Source: https://github.com/ton-foundation/ton/blob/ae5c0720143e231c32c3d2034cfe4e533a16d969/crypto/block/mc-config.cpp#L1232
function parseShards(cs) {
    if (!cs.readBit()) {
        throw Error('Invalid slice');
    }
    return (0, ton_1.parseDict)(cs.readRef(), 32, (cs2) => {
        let stack = [{ slice: cs2.readRef(), shard: new bn_js_1.default(1).shln(63) }];
        let res = new Map();
        while (stack.length > 0) {
            let item = stack.pop();
            let slice = item.slice;
            let shard = item.shard;
            let t = slice.readBit();
            if (!t) {
                slice.skip(4);
                let seqno = slice.readUintNumber(32);
                let id = new ton_tl_1.TLReadBuffer(shard.toBuffer('le', 32)).readInt64(); // Unsigned to Signed
                res.set(id, seqno);
                continue;
            }
            let delta = shard.and(shard.notn(64).addn(1)).shrn(1);
            stack.push({ slice: slice.readRef(), shard: shard.sub(delta) });
            stack.push({ slice: slice.readRef(), shard: shard.add(delta) });
        }
        return res;
    });
}
exports.parseShards = parseShards;
