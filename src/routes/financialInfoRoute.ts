import express from "express";
import { updateFinancialStep } from "../controllers/financialInfoController";
import { upload } from "../middlewares/upload";
import { authenticate } from "../middlewares/authMiddleware";

const router = express.Router();

// Configure multer storag

router.post(
  "/finance",
  authenticate,
  upload.fields([{ name: "financial_document", maxCount: 1 }]),
  updateFinancialStep
);

export default router;
