import { Request, Response } from "express";
import { db } from "../config/db";

export const addBuildingInfo = async (req: Request, res: Response) => {
    try {
        const {
            owns_building,
            class_rooms,
            properly_equipped,
            electric_fitted,
        } = req.body;

        const user_id = req.body?.userId;

        const classRooms = class_rooms ? Number(class_rooms) : null;
        const properlyEquipped =
            properly_equipped?.toLowerCase() === "yes" ||
            properly_equipped?.toLowerCase() === "true";
        const electricFittedVal =
            electric_fitted?.toLowerCase() === "yes" ||
            electric_fitted?.toLowerCase() === "true";

        // Optional file fields
        const buildingPlanPath =
            (req.files as any)?.building_plan_attached?.[0]?.path || null;
        const leaseCopyPath =
            (req.files as any)?.lease_copy_attached?.[0]?.path || null;

        // Validation for lease copy
        if (owns_building?.toLowerCase() === "lease" && !leaseCopyPath) {
            return res.status(400).json({
                error: "Lease copy file is required when owns_building is 'lease'.",
            });
        }

        const query = `
      UPDATE affiliation_forms 
      SET
        owns_building = ?,
        building_plan_attached = ?,
        lease_copy_attached = ?,
        class_rooms = ?,
        properly_equipped = ?,
        electric_fitted = ?,
        updated_at = NOW()
      WHERE user_id = ?
    `;

        const values = [

            owns_building,
            buildingPlanPath,
            leaseCopyPath,
            classRooms,
            properlyEquipped,
            electricFittedVal,
            user_id
        ];

        await db.query(query, values);

        res.status(201).json({ message: "Building information saved successfully." });
    } catch (error) {
        console.error("Error saving building info:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};
