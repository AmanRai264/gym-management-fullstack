require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const User = require("./models/User");
const { seed } = require("./seed/seed");
const { errorHandler, notFound } = require("./middleware/errorHandler");

(async () => {
  try {
    await connectDB();
    if ((await User.countDocuments()) === 0) {
      console.log("[DB] No demo data found. Seeding the database...");
      await seed();
    }
  } catch (error) {
    console.error("[DB] Initialization failed:", error.message);
  }
})();

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "5mb" }));
app.use(morgan(process.env.NODE_ENV === "development" ? "dev" : "combined"));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500 });
app.use("/api", limiter);

app.get("/api/health", (req, res) => res.json({ success: true, message: "Gym Management API is running" }));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/members", require("./routes/memberRoutes"));
app.use("/api/trainers", require("./routes/trainerRoutes"));
app.use("/api/membership-plans", require("./routes/membershipPlanRoutes"));
app.use("/api/attendance", require("./routes/attendanceRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/workout-plans", require("./routes/workoutRoutes"));
app.use("/api/diet-plans", require("./routes/dietRoutes"));
app.use("/api/progress", require("./routes/progressRoutes"));
app.use("/api/equipment", require("./routes/equipmentRoutes"));
app.use("/api/expenses", require("./routes/expenseRoutes"));
app.use("/api/classes", require("./routes/classRoutes"));
app.use("/api/staff", require("./routes/staffRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/announcements", require("./routes/announcementRoutes"));
app.use("/api/settings", require("./routes/settingsRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`[Server] Running on http://localhost:${PORT}`));
