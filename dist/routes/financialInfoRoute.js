"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const financialInfoController_1 = require("../controllers/financialInfoController");
const upload_1 = require("../middlewares/upload");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
// Configure multer storag
router.post("/finance", authMiddleware_1.authenticate, upload_1.upload.fields([{ name: "financial_document", maxCount: 1 }]), financialInfoController_1.updateFinancialStep);
exports.default = router;
