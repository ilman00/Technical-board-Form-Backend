"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const upload_1 = require("../middlewares/upload");
const buildingInfoController_1 = require("../controllers/buildingInfoController");
const router = express_1.default.Router();
router.post("/building", authMiddleware_1.authenticate, upload_1.upload.fields([
    { name: "building_plan_attached", maxCount: 1 },
    { name: "lease_copy_attached", maxCount: 1 },
]), buildingInfoController_1.addBuildingInfo);
exports.default = router;
