import { Request, Response } from "express";
import { db } from "../config/db";

export const addEquipmentInfo = async (req: Request, res: Response) => {
  try {
    const user_id = req.user?.userId;

    if (!user_id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Extract text values from body
    const {
      lab_equipment_list,
      applied_trades_equipment,
      library_books_list,
      amount_spent,
    } = req.body;

    // Extract file paths (if uploaded)
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    const labEquipmentFile = files?.lab_equipment_list?.[0]?.path || null;
    const appliedTradesFile = files?.applied_trades_equipment?.[0]?.path || null;
    const libraryBooksFile = files?.library_books_list?.[0]?.path || null;
    const amountSpentFile = files?.amount_spent?.[0]?.path || null;

    // Validation: if both file and text exist for same field, reject
    const invalidFields: string[] = [];

    if (lab_equipment_list && labEquipmentFile)
      invalidFields.push("lab_equipment_list");
    if (applied_trades_equipment && appliedTradesFile)
      invalidFields.push("applied_trades_equipment");
    if (library_books_list && libraryBooksFile)
      invalidFields.push("library_books_list");
    if (amount_spent && amountSpentFile)
      invalidFields.push("amount_spent");

    if (invalidFields.length > 0) {
      return res.status(400).json({
        error: `You can either upload a file OR enter text for: ${invalidFields.join(", ")}`,
      });
    }

    // Determine final values (file path > text > null)
    const labEquipmentValue = labEquipmentFile || lab_equipment_list || null;
    const appliedTradesValue = appliedTradesFile || applied_trades_equipment || null;
    const libraryBooksValue = libraryBooksFile || library_books_list || null;
    const amountSpentValue = amountSpentFile || amount_spent || null;

    const query = `
      UPDATE affiliation_forms
      SET
        lab_equipment_list = ?,
        applied_trades_equipment = ?,
        library_books_list = ?,
        amount_spent = ?,
        updated_at = NOW()
      WHERE user_id = ?
    `;

    const values = [
      labEquipmentValue,
      appliedTradesValue,
      libraryBooksValue,
      amountSpentValue,
      user_id,
    ];

    await db.query(query, values);

    res.status(200).json({
      success: true,
      message: "Equipment information saved successfully.",
    });
  } catch (error) {
    console.error("Error saving equipment info:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};
