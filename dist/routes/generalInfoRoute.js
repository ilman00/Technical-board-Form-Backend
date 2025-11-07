"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/affiliationForm.routes.ts
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const upload_1 = require("../middlewares/upload");
const generalInfo_1 = require("../controllers/generalInfo");
const router = express_1.default.Router();
router.post("/general", authMiddleware_1.authenticate, upload_1.upload.none(), generalInfo_1.updateGeneralStep);
exports.default = router;
