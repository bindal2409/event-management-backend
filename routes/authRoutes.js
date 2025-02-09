import express from "express";
import { registerUser, loginUser, guestLogin, logoutUser } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/guest", guestLogin); // ✅ Add Guest Login Route

export default router;
