const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const questionRoutes = require("./routes/questionRoutes");
const attemptRoutes  = require("./routes/attemptRoutes");
const authRoutes     = require("./routes/authRoutes");
const subjectRoutes  = require("./routes/subjectRoutes");

const app = express();

// Connect DB
connectDB();

// ── CORS ──────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://brightbudz.vercel.app",      // Production Vercel domain
  process.env.FRONTEND_URL,            // https://brightbudz.com
  process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.replace("https://", "https://www.")
    : null,                            // https://www.brightbudz.com
];

// Add any additional origins from environment variable ALLOWED_ORIGINS (comma-separated list)
if (process.env.ALLOWED_ORIGINS) {
  const extraOrigins = process.env.ALLOWED_ORIGINS.split(",").map(o => o.trim());
  allowedOrigins.push(...extraOrigins);
}

const finalAllowedOrigins = allowedOrigins.filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server requests (no origin), listed origins, or Vercel preview domains matching brightbudz
    const isAllowedVercel = origin && /^https:\/\/brightbudz.*\.vercel\.app$/.test(origin);

    if (!origin || finalAllowedOrigins.includes(origin) || isAllowedVercel) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  credentials: true,
}));

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/attempts", attemptRoutes);
app.use("/api/subjects", subjectRoutes);

// Health Check (optional but professional)
app.get("/", (req, res) => {
  res.send("EdTech API Running 🚀");
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT} 🚀`)
);
