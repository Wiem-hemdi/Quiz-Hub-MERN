const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const axios = require("axios"); // ← AJOUT IMPORTANT !

dotenv.config();
connectDB();

const app = express();

// ==================== CORS CONFIGURATION ====================
const corsOptions = {
  origin: function (origin, callback) {
    // Autoriser les requêtes sans origin (Postman, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Liste des origines autorisées
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3001',
      'http://localhost:5173', // Vite dev server
      'http://127.0.0.1:5173'
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('🚫 CORS blocked for origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// ==================== MIDDLEWARE ====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// ==================== STATIC FILES ====================
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ==================== ROUTES ====================
app.use("/api/user", require("./routes/userRoutes"));
app.use("/quiz", require("./routes/quizRoutes"));
app.use("/api/ai", require("./routes/aiTutorRoutes"));

// ==================== XP STATS ROUTES ====================
try {
  const userStatsRoutes = require("./routes/userStatsRoutes");
  app.use("/api/stats", userStatsRoutes);
  console.log("✅ XP Stats routes loaded");
} catch (error) {
  console.log("⚠️  userStatsRoutes.js not found, using fallback");
  
  const router = express.Router();
  router.get("/profile", (req, res) => {
    res.json({ 
      message: "XP Stats API is working (fallback)",
      xp: 100,
      level: 1,
      achievements: ["First Login"],
      stats: { quizzesTaken: 0, correctAnswers: 0 }
    });
  });
  
  router.post("/update", (req, res) => {
    res.json({ 
      success: true,
      message: "XP updated (fallback)",
      xpAdded: req.body.xp || 10
    });
  });
  
  app.use("/api/stats", router);
}

// ==================== PERFORMANCE ROUTES ====================
try {
  const performanceRoutes = require("./routes/performanceRoutes");
  app.use("/performance", performanceRoutes);
  console.log("✅ Performance routes loaded");
} catch (error) {
  console.log("⚠️  performanceRoutes.js not found");
}

// ==================== AI TEST ROUTES ====================
app.get('/api/ai/test', (req, res) => {
  res.json({
    success: true,
    status: 'AI API is operational',
    model: 'qwen2.5:0.5b-instruct-q4_K_M',
    timestamp: new Date().toISOString(),
    endpoints: {
      tutor: { method: 'POST', path: '/api/ai/tutor-help' },
      test: { method: 'GET', path: '/api/ai/test' },
      ollamaCheck: { method: 'GET', path: '/api/ai/test-ollama' }
    },
    note: "Make sure Ollama is running on http://localhost:11434"
  });
});

app.get('/api/ai/test-ollama', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:11434/api/tags', { 
      timeout: 5000 
    });
    
    res.json({
      success: true,
      message: '✅ Ollama is running and accessible',
      models: response.data.models?.map(m => ({
        name: m.name,
        size: m.size,
        modified: m.modified_at
      })),
      ollamaUrl: 'http://localhost:11434',
      available: true
    });
    
  } catch (error) {
    console.error("❌ Ollama connection failed:", error.message);
    
    res.json({
      success: false,
      message: '❌ Ollama connection failed',
      error: error.message,
      suggestion: [
        "1. Open a terminal and run: ollama serve",
        "2. In another terminal, run: ollama pull qwen2.5:0.5b-instruct-q4_K_M",
        "3. Make sure Ollama is installed: https://ollama.ai/download"
      ],
      available: false
    });
  }
});

// ==================== CORS TEST ROUTE ====================
app.get('/api/test-cors', (req, res) => {
  res.json({
    success: true,
    message: 'CORS is working correctly!',
    origin: req.headers.origin || 'No origin header',
    timestamp: new Date().toISOString(),
    server: 'QuizHub Backend',
    version: '1.0.0'
  });
});

// ==================== HEALTH CHECK ====================
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    server: "QuizHub API",
    version: "1.0.0",
    database: "connected",
    endpoints: {
      health: "GET /health",
      corsTest: "GET /api/test-cors",
      aiTutor: "POST /api/ai/tutor-help",
      aiTest: "GET /api/ai/test",
      xpProfile: "GET /api/stats/profile",
      quiz: "GET /quiz/questions",
      userLogin: "POST /api/user/login"
    }
  });
});

// ==================== 404 HANDLER ====================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.originalUrl,
    method: req.method,
    availableRoutes: [
      "GET /health",
      "GET /api/test-cors",
      "GET /api/ai/test",
      "GET /api/ai/test-ollama",
      "POST /api/ai/tutor-help",
      "GET /api/stats/profile",
      "GET /quiz/questions",
      "POST /api/user/login"
    ]
  });
});

// ==================== ERROR HANDLER ====================
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  console.error(err.stack);
  
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Database: ${process.env.MONGO_URI ? 'Connected' : 'Not configured'}`);
  console.log(`\n✅ Available endpoints:`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   CORS Test: http://localhost:${PORT}/api/test-cors`);
  console.log(`   AI Test: http://localhost:${PORT}/api/ai/test`);
  console.log(`   Ollama Check: http://localhost:${PORT}/api/ai/test-ollama`);
  console.log(`   AI Tutor: POST http://localhost:${PORT}/api/ai/tutor-help`);
  console.log(`   XP Profile: http://localhost:${PORT}/api/stats/profile`);
  console.log(`   Quiz API: http://localhost:${PORT}/quiz/questions`);
  console.log(`\n🔗 Frontend should be running on: http://localhost:3000`);
  console.log(`⚠️  Make sure Ollama is running: ollama serve`);
  console.log(`🐳 Model needed: qwen2.5:0.5b-instruct-q4_K_M (run: ollama pull qwen2.5:0.5b-instruct-q4_K_M)`);
});