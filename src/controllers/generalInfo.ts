// src/controllers/affiliationForm.controller.ts
import { Request, Response } from "express";
import {db} from "../config/db";

export const updateGeneralStep = async (req: Request, res: Response) => {
  const user_id = req.user?.userId;
  if (!user_id)
    return res.status(401).json({ success: false, message: "Unauthorized" });

  const { institute_name, address, trade_required } = req.body;
  
//   if(typeof req.body.classes_start_date === "string"){

//   }
  const classes_start_date = new Date(req.body.classes_start_date)

  if (!institute_name || !address || !trade_required || !classes_start_date) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    const sql = `
      UPDATE affiliation_forms
      SET institute_name = ?, address = ?, trade_required = ?, classes_start_date = ?, updated_at = NOW()
      WHERE user_id = ?
    `;

    await db.query(sql, [
      institute_name,
      address,
      trade_required,
      classes_start_date,
      user_id,
    ]);

    res.json({ success: true, message: "General step updated successfully" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
