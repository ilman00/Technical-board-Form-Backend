// src/controllers/instituteDocs.controller.ts
import { Request, Response } from "express";
import { db } from "../config/db";

export const updateInstituteDocs = async (req: Request, res: Response) => {
  const user_id = req.user?.userId;

  if (!user_id)
    return res.status(401).json({ success: false, message: "Unauthorized" });

  try {
    // Extract uploaded file paths
    const institute_doc = (req.files as any)?.institute_doc?.[0]?.path || null;
    const mission_statement_institute =
      (req.files as any)?.mission_statement_institute?.[0]?.path || null;
    const application_to_secretory_ttb =
      (req.files as any)?.application_to_secretory_ttb?.[0]?.path || null;

    const sql = `
      UPDATE affiliation_forms
      SET 
        institute_doc = ?,
        mission_statement_institute = ?,
        application_to_secretory_ttb = ?,
        updated_at = NOW()
      WHERE user_id = ?
    `;

    await db.query(sql, [
      institute_doc,
      mission_statement_institute,
      application_to_secretory_ttb,
      user_id,
    ]);

    res.json({
      success: true,
      message: "Institute documents updated successfully",
    });
  } catch (err: any) {
    console.error("Error updating institute documents:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
