// src/routes/affiliationForm.routes.ts
import express from "express";
import { authenticate } from "../middlewares/authMiddleware";
import { upload } from "../middlewares/upload";
import { updateGeneralStep } from "../controllers/generalInfo";

const router = express.Router();

router.post("/general", authenticate, upload.none(), updateGeneralStep);

export default router;
