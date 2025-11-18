import express from "express";
import { authenticate } from "../middlewares/authMiddleware";
import { upload } from "../middlewares/upload";
import { updatePartners } from "../controllers/partnersInfoController"

const router = express.Router()

router.post(
  "/update-partners",
  authenticate,
  upload.fields([
    { name: "partner1_signature", maxCount: 1 },
    { name: "partner2_signature", maxCount: 1 },
  ]),
  updatePartners
);

export default router;