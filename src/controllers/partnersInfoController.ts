// src/controllers/partners.controller.ts
import { Request, Response } from "express";
import { db } from "../config/db";

export const updatePartners = async (req: Request, res: Response) => {
  const user_id = req.user?.userId;

  if (!user_id)
    return res.status(401).json({ success: false, message: "Unauthorized" });

  try {
    const {
      partner1_name,
      partner1_cnic,
      partner2_name,
      partner2_cnic,
    } = req.body;

    // Optional file uploads for partner signatures
    const partner1_signature = (req.files as any)?.partner1_signature?.[0]?.path || null;
    const partner2_signature = (req.files as any)?.partner2_signature?.[0]?.path || null;

    const sql = `
      UPDATE affiliation_forms
      SET 
        partner1_name = ?,
        partner1_cnic = ?,
        partner1_signature = COALESCE(?, partner1_signature),
        partner2_name = ?,
        partner2_cnic = ?,
        partner2_signature = COALESCE(?, partner2_signature),
        updated_at = NOW()
      WHERE user_id = ?
    `;

    await db.query(sql, [
      partner1_name,
      partner1_cnic,
      partner1_signature,
      partner2_name,
      partner2_cnic,
      partner2_signature,
      user_id,
    ]);

    res.json({
      success: true,
      message: "Partner information updated successfully",
    });
  } catch (err: any) {
    console.error("Error updating partner info:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
