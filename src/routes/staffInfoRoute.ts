// src/routes/affiliationForm.routes.ts
import express from "express";
import { authenticate } from "../middlewares/authMiddleware";
import { upload } from "../middlewares/upload";
import { updateStaffStep } from "../controllers/staffInfoController";

const router = express.Router();

router.post(
  "/staff",
  authenticate,
  upload.fields([
    { name: "staff_statement", maxCount: 1 },
    { name: "teacher_agreement", maxCount: 1 },
    { name: "salary_scales", maxCount: 1 },
  ]),
  updateStaffStep
);

export default router;
