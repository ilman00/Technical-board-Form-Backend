import express from "express";
import { addEquipmentInfo } from "../controllers/equipmentsInfoController";
import { upload } from "../middlewares/upload"; // your multer setup
import { authenticate } from "../middlewares/authMiddleware"; // assuming JWT/session auth

const router = express.Router();

// Configure multer to accept optional file uploads for each field
router.post(
  "/equipment",
  authenticate,
  upload.fields([
    { name: "lab_equipment_list", maxCount: 1 },
    { name: "applied_trades_equipment", maxCount: 1 },
    { name: "library_books_list", maxCount: 1 },
    { name: "amount_spent", maxCount: 1 },
  ]),
  addEquipmentInfo
);

export default router;
