require("dotenv").config();
const connectDB = require("./config/db");
const User = require("./models/User");
const { seed } = require("./seed/seed");
const app = require("./app");

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

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`[Server] Running on http://localhost:${PORT}`));
})();
