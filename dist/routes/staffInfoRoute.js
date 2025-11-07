"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/affiliationForm.routes.ts
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const upload_1 = require("../middlewares/upload");
const staffInfoController_1 = require("../controllers/staffInfoController");
const router = express_1.default.Router();
router.post("/staff", authMiddleware_1.authenticate, upload_1.upload.fields([
    { name: "staff_statement", maxCount: 1 },
    { name: "teacher_agreement", maxCount: 1 },
    { name: "salary_scales", maxCount: 1 },
]), staffInfoController_1.updateStaffStep);
exports.default = router;
