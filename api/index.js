// Vercel Function entrypoint. vercel.json rewrites every /api/* request here,
// and the shared Express app does the actual routing.
require("dotenv").config({ path: require("path").join(__dirname, "..", "backend", ".env") });

const app = require("../backend/app");
const connectDB = require("../backend/config/db");
const User = require("../backend/models/User");
const { seed } = require("../backend/seed/seed");

// Runs once per warm function instance, not once per request.
let bootstrapPromise = null;
let isBootstrapped = false;

const bootstrap = async () => {
  await connectDB();
  if ((await User.countDocuments()) === 0) {
    console.log("[DB] No demo data found. Seeding the database...");
    await seed();
  }
};

// Vercel strips the /api prefix when it internally rewrites "/api/(.*)" to
// "/api/index". Express routes are mounted under /api, so restore the prefix
// before handing the request over.
const normalizeUrl = (url) => {
  const path = url || "/";

  if (path === "/api" || path.startsWith("/api/")) {
    return path.replace(/^\/api\/index/, "/api");
  }

  return path === "/" ? "/api" : `/api${path.startsWith("/") ? path : `/${path}`}`;
};

module.exports = async (req, res) => {
  try {
    if (!isBootstrapped) {
      if (!bootstrapPromise) bootstrapPromise = bootstrap();
      await bootstrapPromise;
      isBootstrapped = true;
    }
  } catch (error) {
    // Let the next request retry instead of caching the failure forever.
    bootstrapPromise = null;
    res.statusCode = 503;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ success: false, message: `Database unavailable: ${error.message}` }));
    return;
  }

  req.url = normalizeUrl(req.url);
  return app(req, res);
};
