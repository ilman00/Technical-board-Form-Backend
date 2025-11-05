// src/controllers/affiliationForm.controller.ts
import { Request, Response } from "express";
import { db } from "../config/db";

export const updateFinancialStep = async (req: Request, res: Response) => {
    const user_id = req.user?.userId;
    console.log("Finance User: ", user_id)
    if (!user_id)
        return res.status(401).json({ success: false, message: "Unauthorized" });

    try {
        const { endowment_fund, fund_balance, income_sources, annual_fee_income_estimate, annual_expenditure_estimate } = req.body;

        // Extract file path for financial document
        const financial_document = (req.files as any)?.financial_document?.[0]?.path || null;

        const sql = `
      UPDATE affiliation_forms
      SET 

        endowment_fund = ?,
        fund_balance = ?, 
        income_sources = ?, 
        annual_fee_income_estimate = ?, 
        annual_expenditure_estimate = ?, 
        financial_document = ?, 
        updated_at = NOW()
      WHERE user_id = ?
    `;

        await db.query(sql, [
            endowment_fund,
            fund_balance,
            income_sources,
            annual_fee_income_estimate,
            annual_expenditure_estimate,
            financial_document,
            user_id,
        ]);

        res.json({ success: true, message: "Financial step updated successfully" });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};
