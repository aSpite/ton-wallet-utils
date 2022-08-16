"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const ton_tl_1 = require("ton-tl");
let source = fs_1.default.readFileSync(__dirname + '/schema.tl', 'utf-8');
let generated = (0, ton_tl_1.generate)(source);
fs_1.default.writeFileSync(__dirname + '/schema.ts', generated);
