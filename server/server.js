const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const connectDB = require("./config/database");
const errorHandler = require("./middleware/errorHandler");

// Route imports
const authRoutes = require("./routes/auth");
const passwordRoutes = require("./routes/passwords");
const userRoutes = require("./routes/user");
const utilityRoutes = require("./routes/utility");

const app = express();

// Connect to database
connectDB();

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parser middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/passwords", passwordRoutes);
app.use("/api/user", userRoutes);
app.use("/api/utility", utilityRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

// Test encryption endpoint
app.post("/api/test-encryption", (req, res) => {
  try {
    const { encryptPassword, decryptPassword } = require("./utils/encryption");
    const testText = req.body.text || "test123";

    const encrypted = encryptPassword(testText);
    const decrypted = decryptPassword(encrypted);

    res.json({
      success: true,
      original: testText,
      encrypted: encrypted,
      decrypted: decrypted,
      match: testText === decrypted,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
