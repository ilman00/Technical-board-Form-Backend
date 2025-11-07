"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const equipmentsInfoController_1 = require("../controllers/equipmentsInfoController");
const upload_1 = require("../middlewares/upload"); // your multer setup
const authMiddleware_1 = require("../middlewares/authMiddleware"); // assuming JWT/session auth
const router = express_1.default.Router();
// Configure multer to accept optional file uploads for each field
router.post("/equipment", authMiddleware_1.authenticate, upload_1.upload.fields([
    { name: "lab_equipment_list", maxCount: 1 },
    { name: "applied_trades_equipment", maxCount: 1 },
    { name: "library_books_list", maxCount: 1 },
    { name: "amount_spent", maxCount: 1 },
]), equipmentsInfoController_1.addEquipmentInfo);
exports.default = router;
