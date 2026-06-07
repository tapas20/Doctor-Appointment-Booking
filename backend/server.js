import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";

const app = express();
const port = process.env.PORT || 4000;

connectCloudinary();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  }),
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/applications", applicationRoutes);

// Health check
app.get("/", (req, res) => res.json({ status: "API is running" }));

// 404 handler
app.use((req, res) =>
  res.status(404).json({ success: false, message: "Route not found." }),
);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal server error." });
});

connectDB()
  .then(() =>
    app.listen(port, () => console.log(`Server running on port ${port}`)),
  )
  .catch((err) => console.error("DB connection error:", err.message));
