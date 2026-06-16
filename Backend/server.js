import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import uploadRoutes from "./routes/uploadRoutes.js";
import waitlistRoutes from "./routes/waitlistRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import { initDB } from "./db/db.js";

dotenv.config({ path: new URL("./.env", import.meta.url) });

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", uploadRoutes);
app.use("/api", waitlistRoutes);
app.use("/api", userRoutes);
app.use("/api", chatRoutes);
app.use("/api", contactRoutes);

const PORT = 5001;

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
