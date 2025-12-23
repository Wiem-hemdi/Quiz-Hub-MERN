const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const uploadQuestion = require("../controllers/uploadQuestionControllers");
const { getQuestions, getAnswers, getLanguages, getTestNames } = require("../controllers/quizControllers");
const multer = require("multer");

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload question - Accepte form-data OU JSON
router.post("/upload", protect, upload.single("image"), uploadQuestion);

// Autres routes
router.post("/questions", protect, getQuestions);
router.post("/answers", protect, getAnswers);
router.get("/languages", protect, getLanguages);
router.get("/test-names", protect, getTestNames);

module.exports = router;