import express from "express"
import { authenticate } from "../middlewares/authMiddleware";
import { upload } from "../middlewares/upload";
import { addBuildingInfo } from "../controllers/buildingInfoController";

const router = express.Router()



router.post(
    "/building",
    authenticate,
    upload.fields([
        { name: "building_plan_attached", maxCount: 1 },
        { name: "lease_copy_attached", maxCount: 1 },
    ]),
    addBuildingInfo
);

export default router;