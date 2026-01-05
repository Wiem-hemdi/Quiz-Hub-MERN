const express = require("express");
const router = express.Router();

// Importez votre modèle QuizScore s'il existe
let QuizScore;
try {
  // Essayez d'importer votre modèle de scores
  QuizScore = require("../models/QuizScore");
} catch (error) {
  console.log("QuizScore model not found, using simulated data");
  QuizScore = null;
}

// Route temporaire pour tester
router.get("/test", (req, res) => {
  res.json({ 
    success: true, 
    message: "XP Stats API is working",
    timestamp: new Date().toISOString()
  });
});

// Route profil utilisateur
router.get("/profile", async (req, res) => {
  try {
    // Vérifier l'authentification
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, error: "Not authorized" });
    }

    // Ici, vous devriez décoder le token JWT pour obtenir l'ID utilisateur
    // Pour l'instant, utilisons un ID simulé
    const userId = "simulated_user_id";
    
    // Si vous avez un modèle User, récupérez les données
    let userStats = {
      _id: userId,
      name: "Test User",
      email: "test@example.com",
      xp: 150,
      level: 2,
      streak: 3,
      badges: ["Quiz Starter", "5-Streak"],
      totalQuizzes: 15,
      accuracy: 75.5,
      categoryStats: {
        French: { correct: 10, total: 12, xp: 120 },
        English: { correct: 8, total: 10, xp: 80 },
        Arabic: { correct: 5, total: 8, xp: 50 }
      },
      createdAt: new Date().toISOString()
    };

    res.json(userStats);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching profile'
    });
  }
});

// Route leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    // Si le modèle QuizScore existe, utiliser les vraies données
    if (QuizScore) {
      const leaderboard = await QuizScore.aggregate([
        {
          $group: {
            _id: "$user", // Grouper par ID utilisateur
            name: { $first: "$userName" },
            email: { $first: "$userEmail" },
            maxScore: { $max: "$score" }, // Prendre le meilleur score
            totalTests: { $sum: 1 }, // Compter le nombre de tests
            lastAttempt: { $max: "$createdAt" } // Dernière tentative
          }
        },
        {
          $sort: { maxScore: -1 } // Trier par score descendant
        },
        {
          $limit: 10 // Limiter aux 10 premiers
        },
        {
          $project: {
            _id: 0,
            name: 1,
            email: 1,
            score: "$maxScore",
            totalTests: 1,
            lastAttempt: 1
          }
        }
      ]);

      // Ajouter le rang
      const rankedLeaderboard = leaderboard.map((player, index) => ({
        ...player,
        rank: index + 1
      }));

      return res.json({
        success: true,
        leaderboard: rankedLeaderboard,
        count: rankedLeaderboard.length
      });
    } else {
      // Si pas de modèle, utiliser des données simulées
      console.log("Using simulated leaderboard data");
      
      const simulatedLeaderboard = [
        { rank: 1, name: "Alice", email: "alice@example.com", score: 95, totalTests: 25, lastAttempt: new Date().toISOString() },
        { rank: 2, name: "Bob", email: "bob@example.com", score: 92, totalTests: 30, lastAttempt: new Date().toISOString() },
        { rank: 3, name: "Charlie", email: "charlie@example.com", score: 88, totalTests: 18, lastAttempt: new Date().toISOString() },
        { rank: 4, name: "David", email: "david@example.com", score: 85, totalTests: 22, lastAttempt: new Date().toISOString() },
        { rank: 5, name: "Emma", email: "emma@example.com", score: 82, totalTests: 15, lastAttempt: new Date().toISOString() },
        { rank: 6, name: "Frank", email: "frank@example.com", score: 78, totalTests: 20, lastAttempt: new Date().toISOString() },
        { rank: 7, name: "Grace", email: "grace@example.com", score: 75, totalTests: 12, lastAttempt: new Date().toISOString() },
        { rank: 8, name: "Henry", email: "henry@example.com", score: 72, totalTests: 8, lastAttempt: new Date().toISOString() },
        { rank: 9, name: "Ivy", email: "ivy@example.com", score: 70, totalTests: 10, lastAttempt: new Date().toISOString() },
        { rank: 10, name: "John", email: "john@example.com", score: 68, totalTests: 5, lastAttempt: new Date().toISOString() }
      ];

      return res.json({
        success: true,
        leaderboard: simulatedLeaderboard,
        count: simulatedLeaderboard.length,
        note: "Using simulated data"
      });
    }
  } catch (error) {
    console.error('Leaderboard error:', error);
    
    // Même en cas d'erreur, retourner des données simulées
    const fallbackLeaderboard = [
      { rank: 1, name: "Test User", email: "test@example.com", score: 100, totalTests: 1, lastAttempt: new Date().toISOString() }
    ];
    
    res.json({
      success: true,
      leaderboard: fallbackLeaderboard,
      count: 1,
      error: "Using fallback data due to error",
      note: error.message
    });
  }
});

// Route pour mettre à jour les stats
router.post("/update-stats", async (req, res) => {
  try {
    const { userId, isCorrect, category, score } = req.body;
    
    // Vérifier les données requises
    if (!userId) {
      return res.status(400).json({ success: false, error: "User ID required" });
    }
    
    // Simuler la mise à jour (remplacez par votre logique réelle)
    const xpGained = isCorrect ? 10 : 0;
    const streakBonus = Math.random() > 0.7 ? 5 : 0;
    const totalXPGained = xpGained + streakBonus;
    
    // Nouveaux badges potentiels
    let newBadges = [];
    if (isCorrect) {
      if (Math.random() > 0.8) newBadges.push("Perfect Answer!");
      if (Math.random() > 0.9) newBadges.push("Category Master!");
    }
    
    res.json({
      success: true,
      statsUpdate: {
        userId,
        xpGained: totalXPGained,
        streakBonus,
        category,
        isCorrect,
        score,
        timestamp: new Date().toISOString()
      },
      userStats: {
        xp: 150 + totalXPGained,
        level: Math.floor((150 + totalXPGained) / 100) + 1,
        streak: isCorrect ? 4 : 0,
        badges: ["Quiz Starter", "5-Streak", ...newBadges],
        totalQuizzes: 16,
        accuracy: 76.0,
        categoryStats: {
          French: { correct: 10, total: 12, xp: 120 },
          English: { correct: 8, total: 10, xp: 80 },
          Arabic: { correct: 5, total: 8, xp: 50 }
        }
      },
      newBadges: newBadges.length > 0 ? newBadges : undefined
    });
    
  } catch (error) {
    console.error('Update stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating stats'
    });
  }
});

// Route pour réinitialiser les stats (pour les tests)
router.post("/reset-stats", (req, res) => {
  res.json({
    success: true,
    message: "Stats reset to default",
    userStats: {
      xp: 0,
      level: 1,
      streak: 0,
      badges: [],
      totalQuizzes: 0,
      accuracy: 0,
      categoryStats: {}
    }
  });
});

module.exports = router;