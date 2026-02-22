import express from "express";
import {registerParticipant, loginUser} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerParticipant);
router.post("/login", loginUser);

export default router