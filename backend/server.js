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
  process.env.FRONTEND_URL,            // https://brightbudz.com
  process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.replace("https://", "https://www.")
    : null,                            // https://www.brightbudz.com
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server requests (no origin) and listed origins
    if (!origin || allowedOrigins.includes(origin)) {
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
