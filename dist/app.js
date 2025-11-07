"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const authMiddleware_1 = require("./middlewares/authMiddleware");
const generalInfoRoute_1 = __importDefault(require("./routes/generalInfoRoute"));
const staffInfoRoute_1 = __importDefault(require("./routes/staffInfoRoute"));
const financialInfoRoute_1 = __importDefault(require("./routes/financialInfoRoute"));
const buildingInfoRoute_1 = __importDefault(require("./routes/buildingInfoRoute"));
const equipmentInfoRoute_1 = __importDefault(require("./routes/equipmentInfoRoute"));
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./config/db");
exports.app = (0, express_1.default)();
exports.app.use(express_1.default.json());
exports.app.use((0, cookie_parser_1.default)());
exports.app.use((0, cors_1.default)({
    origin: ["http://localhost:3000", "http://localhost:5173", "https://ttb.digipakistan.com"], // allowed origins
    methods: ["GET", "POST", "PUT", "DELETE"], // allowed methods
    credentials: true, // allow cookies if needed
}));
exports.app.use("/api/auth", authRoutes_1.default);
exports.app.use("/api", generalInfoRoute_1.default);
exports.app.use("/api", staffInfoRoute_1.default);
exports.app.use("/api", financialInfoRoute_1.default);
exports.app.use("/api", buildingInfoRoute_1.default);
exports.app.use("/api", equipmentInfoRoute_1.default);
if (process.env.NODE_ENV === "production") {
    exports.app.set("trust proxy", 1);
}
exports.app.get("/", (req, res) => {
    res.send({ message: "Hello TypeScript + Node.js!" });
});
exports.app.get("/api/me", authMiddleware_1.authenticate, (req, res) => {
    try {
        console.log("HIT /api/me in app.ts");
        const user = req.user?.userId;
        const query = "SELECT * FROM affiliation_forms where user_id=? ";
        const values = [user];
        const result = db_1.db.query(query, values);
        res.status(201).json({ UserId: user, Result: result });
    }
    catch (error) {
        console.error("Error saving building info:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});
