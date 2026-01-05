const express = require("express");
const router = express.Router();
const { tutorHelp, testOllama } = require("../controllers/aiTutorController");

// Routes publiques de test
router.get("/test-ollama", testOllama);
router.get("/test", (req, res) => {
  res.json({ 
    status: "AI System OK", 
    model: "qwen2.5:0.5b-instruct-q4_K_M",
    backend: "Running",
    timestamp: new Date().toISOString()
  });
});

router.post("/tutor-help", tutorHelp);

module.exports = router;