import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import contestRoutes from "./routes/contestRoutes.js";
import sheetRoutes from "./routes/sheetRoutes.js";
import traineeRoutes from "./routes/traineeRoutes.js";
import trainingRoutes from "./routes/trainingRoutes.js";
import standingsRoutes from "./routes/standingsRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// API Routes
app.use("/api/contests", contestRoutes);
app.use("/api/sheets", sheetRoutes);
app.use("/api/trainees", traineeRoutes);
app.use("/api/trainings", trainingRoutes);
app.use("/api/standings", standingsRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    error: "Something went wrong!", 
    message: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});


// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    app.listen(process.env.PORT, () =>
      console.log(`🚀 Server running on port ${process.env.PORT}`)
    );
  })
  .catch((err) => console.error("❌ MongoDB connection failed:", err));
