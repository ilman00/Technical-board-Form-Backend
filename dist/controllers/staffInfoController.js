"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStaffStep = void 0;
const db_1 = require("../config/db");
const updateStaffStep = async (req, res) => {
    const user_id = req.user?.userId;
    if (!user_id)
        return res.status(401).json({ success: false, message: "Unauthorized" });
    try {
        const proposed_appointment = req.body.proposed_appointment || null;
        // Extract file paths (if uploaded)
        const staff_statement = req.files?.staff_statement?.[0]?.path || null;
        const teacher_agreement = req.files?.teacher_agreement?.[0]?.path || null;
        const salary_scales = req.files?.salary_scales?.[0]?.path || null;
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
        await db_1.db.query(sql, [
            staff_statement,
            teacher_agreement,
            salary_scales,
            proposed_appointment,
            user_id,
        ]);
        res.json({ success: true, message: "Staff step updated successfully" });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.updateStaffStep = updateStaffStep;
