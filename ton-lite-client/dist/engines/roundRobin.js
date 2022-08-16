"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _LiteRoundRobinEngine_closed, _LiteRoundRobinEngine_counter;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiteRoundRobinEngine = void 0;
const teslabot_1 = require("teslabot");
class LiteRoundRobinEngine {
    constructor(engines) {
        _LiteRoundRobinEngine_closed.set(this, false);
        _LiteRoundRobinEngine_counter.set(this, 0);
        this.engines = engines;
    }
    async query(f, req, args) {
        var _a, _b;
        if (__classPrivateFieldGet(this, _LiteRoundRobinEngine_closed, "f")) {
            throw new Error('Engine is closed');
        }
        let attempts = 0;
        let id = (__classPrivateFieldSet(this, _LiteRoundRobinEngine_counter, (_b = __classPrivateFieldGet(this, _LiteRoundRobinEngine_counter, "f"), _a = _b++, _b), "f"), _a) % this.engines.length;
        let errorsCount = 0;
        while (true) {
            if (this.engines[id].isClosed()) {
                id = (id + 1) % this.engines.length;
                attempts++;
                if (attempts >= this.engines.length) {
                    await (0, teslabot_1.delay)(100);
                }
                if (attempts > 200) {
                    throw new Error('No engines are available');
                }
                continue;
            }
            try {
                const res = await this.engines[id].query(f, req, args);
                return res;
            }
            catch (e) {
                if (e instanceof Error && e.message === 'Timeout') {
                    id = (id + 1) % this.engines.length;
                    continue;
                }
                errorsCount++;
                if (errorsCount > 20) {
                    throw e;
                }
                await (0, teslabot_1.delay)(100);
            }
        }
    }
    close() {
        for (let q of this.engines) {
            q.close();
        }
        __classPrivateFieldSet(this, _LiteRoundRobinEngine_closed, true, "f");
    }
    isClosed() {
        return __classPrivateFieldGet(this, _LiteRoundRobinEngine_closed, "f");
    }
}
exports.LiteRoundRobinEngine = LiteRoundRobinEngine;
_LiteRoundRobinEngine_closed = new WeakMap(), _LiteRoundRobinEngine_counter = new WeakMap();
