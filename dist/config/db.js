"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const env_1 = require("./env");
exports.db = promise_1.default.createPool({
    host: env_1.env.DB_HOST,
    user: env_1.env.DB_USER,
    password: env_1.env.DB_PASS,
    database: env_1.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
