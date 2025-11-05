// src/controllers/affiliationForm.controller.ts
import { Request, Response } from "express";
import { db } from "../config/db";

export const updateStaffStep = async (req: Request, res: Response) => {
  const user_id = req.user?.userId;
  if (!user_id)
    return res.status(401).json({ success: false, message: "Unauthorized" });

  try {
    const proposed_appointment = req.body.proposed_appointment || null;

    // Extract file paths (if uploaded)
    const staff_statement =
      (req.files as any)?.staff_statement?.[0]?.path || null;
    const teacher_agreement =
      (req.files as any)?.teacher_agreement?.[0]?.path || null;
    const salary_scales = (req.files as any)?.salary_scales?.[0]?.path || null;

    const sql = `
      UPDATE affiliation_forms
      SET 
        staff_statement = ?, 
        teacher_agreement = ?, 
        salary_scales = ?, 
        proposed_appointments = ?, 
        updated_at = NOW()
      WHERE user_id = ?
    `;

    await db.query(sql, [
      staff_statement,
      teacher_agreement,
      salary_scales,
      proposed_appointment,
      user_id,
    ]);

    res.json({ success: true, message: "Staff step updated successfully" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
