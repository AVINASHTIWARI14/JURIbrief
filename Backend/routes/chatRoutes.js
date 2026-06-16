import express from "express";
import { chatWithJuri } from "../controllers/chatController.js";

const router = express.Router();

router.post("/chat", chatWithJuri);

export default router;
