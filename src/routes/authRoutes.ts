import express from "express";
import { register, verifyEmail, login, refresh, logout } from "../controllers/authController";
const router = express.Router();

router.post("/register", register);
router.get("/verify-email", verifyEmail);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);

export default router;
