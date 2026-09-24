const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { errorHandler, notFound } = require("./middleware/errorHandler");

const app = express();

// Vercel terminates TLS in front of the function, so the real client IP only
// exists in the X-Forwarded-For header. Trusting the proxy keeps the rate
// limiter from rejecting every request.
app.set("trust proxy", 1);

app.use(helmet());

// CLIENT_URL accepts a comma-separated list so the Vercel domain (and the
// local Vite dev server) can both be allowed. When unset, the request origin
// is reflected, which keeps same-origin deployments working out of the box.
const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
    credentials: true,
  })
);

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

module.exports = app;
