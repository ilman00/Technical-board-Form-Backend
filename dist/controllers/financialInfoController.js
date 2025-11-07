"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFinancialStep = void 0;
const db_1 = require("../config/db");
const updateFinancialStep = async (req, res) => {
    const user_id = req.user?.userId;
    console.log("Finance User: ", user_id);
    if (!user_id)
        return res.status(401).json({ success: false, message: "Unauthorized" });
    try {
        const { endowment_fund, fund_balance, income_sources, annual_fee_income_estimate, annual_expenditure_estimate } = req.body;
        // Extract file path for financial document
        const financial_document = req.files?.financial_document?.[0]?.path || null;
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
        await db_1.db.query(sql, [
            endowment_fund,
            fund_balance,
            income_sources,
            annual_fee_income_estimate,
            annual_expenditure_estimate,
            financial_document,
            user_id,
        ]);
        res.json({ success: true, message: "Financial step updated successfully" });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.updateFinancialStep = updateFinancialStep;
