const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const quizRoutes = require("./routes/quiz");
const resultRoutes = require("./routes/result");

const app = express();

/* ===============================
   MIDDLEWARE
================================*/

app.use(cors());
app.use(express.json());

/* ===============================
   API ROUTES
================================*/

app.use("/api/auth", authRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/result", resultRoutes);

/* ===============================
   HEALTH CHECK ROUTE
================================*/

app.get("/api", (req, res) => {
  res.json({ message: "QuizFlow API is running 🚀" });
});

/* ===============================
   SERVE REACT BUILD
================================*/

const frontendBuildPath = path.join(__dirname, "../frontend/build");

app.use(express.static(frontendBuildPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(frontendBuildPath, "index.html"));
});

/* ===============================
   DATABASE CONNECTION
================================*/

const connectDB = async () => {
  try {

    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB Connected");

  } catch (error) {

    console.error("❌ MongoDB connection failed:", error.message);

  }
};

const path = require('path');

// Serve React static files
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Catch-all: send all unknown routes to React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

/* ===============================
   START SERVER
================================*/

const PORT = process.env.PORT || 8080;

app.listen(PORT, async () => {

  console.log(`🚀 Server running on port ${PORT}`);

  await connectDB();

});
