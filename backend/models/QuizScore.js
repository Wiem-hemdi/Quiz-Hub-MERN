const mongoose = require('mongoose');

const quizScoreSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  xpGained: {             // <- XP gagné dans ce quiz
    type: Number,
    default: 0
  },
  category: {
    type: String,
    default: 'General'
  },
  quizId: String,
  timeTaken: Number,       // en secondes
  totalQuestions: Number,
  correctAnswers: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.QuizScore || mongoose.model('QuizScore', quizScoreSchema);
