const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🎯 Servir les fichiers statiques (images)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/user", require("./routes/userRoutes"));
app.use("/quiz", require("./routes/quizRoutes"));

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});