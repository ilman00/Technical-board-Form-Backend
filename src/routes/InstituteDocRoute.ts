import express from "express";
import { authenticate } from "../middlewares/authMiddleware";
import { updateInstituteDocs } from "../controllers/instituteDocsController";
import { upload } from "../middlewares/upload";

const router = express.Router();

router.post(
  "/institute-docs",
  authenticate,
  upload.fields([
    { name: "institute_doc", maxCount: 1 },
    { name: "mission_statement_institute", maxCount: 1 },
    { name: "application_to_secretory_ttb", maxCount: 1 },
  ]),
  updateInstituteDocs
);


export default router;