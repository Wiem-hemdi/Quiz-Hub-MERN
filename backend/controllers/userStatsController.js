const expressAsyncHandler = require("express-async-handler");
const User = require("../models/User");

// Obtenir les stats utilisateur
const getUserStats = expressAsyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .lean();
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Calculer l'accuracy
    const accuracy = user.totalAnswers > 0 
      ? (user.correctAnswers / user.totalAnswers) * 100 
      : 0;
    
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      xp: user.xp || 0,
      level: user.level || 1,
      streak: user.streak || 0,
      badges: user.badges || [],
      totalQuizzes: user.totalQuizzes || 0,
      accuracy: accuracy.toFixed(1),
      categoryStats: user.categoryStats || {},
      createdAt: user.createdAt
    });
    
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mettre à jour le XP après un quiz
const updateUserStats = expressAsyncHandler(async (req, res) => {
  try {
    const { isCorrect, category, quizId } = req.body;
    const userId = req.user._id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    let newBadges = [];
    
    // Calculer le XP gagné
    let xpGained = 0;
    if (isCorrect) {
      // Base XP pour réponse correcte
      xpGained = 10;
      
      // Bonus pour streak
      if (user.streak >= 5) xpGained += 5;
      if (user.streak >= 10) xpGained += 10;
      
      // Bonus pour catégorie
      if (category && user.categoryStats[category]) {
        const catAccuracy = user.categoryStats[category].total > 0 
          ? (user.categoryStats[category].correct / user.categoryStats[category].total) * 100
          : 0;
        if (catAccuracy > 80) xpGained += 5;
      }
    }
    
    // Mettre à jour les stats
    await user.addXP(xpGained, category);
    await user.updateStreak(isCorrect);
    await user.updateQuizStats(isCorrect, category);
    
    // Vérifier les badges
    const badgeResult = await user.checkAndAddBadges();
    newBadges = badgeResult.newBadges;
    
    // Sauvegarder
    await user.save();
    
    res.json({
      success: true,
      userStats: {
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        badges: user.badges,
        totalQuizzes: user.totalQuizzes,
        accuracy: user.totalAnswers > 0 
          ? (user.correctAnswers / user.totalAnswers) * 100 
          : 0,
        categoryStats: user.categoryStats
      },
      xpGained,
      newBadges: newBadges.length > 0 ? newBadges : undefined
    });
    
  } catch (error) {
    console.error('Update user stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Obtenir le leaderboard
const getXPLeaderboard = expressAsyncHandler(async (req, res) => {
  try {
    const users = await User.find({})
      .select('name email xp level badges streak totalQuizzes')
      .sort({ xp: -1, level: -1 })
      .limit(20)
      .lean();
    
    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      name: user.name,
      email: user.email,
      xp: user.xp,
      level: user.level,
      badges: user.badges?.length || 0,
      streak: user.streak,
      quizzes: user.totalQuizzes
    }));
    
    res.json({
      success: true,
      leaderboard
    });
    
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Réinitialiser les stats (admin seulement)
const resetUserStats = expressAsyncHandler(async (req, res) => {
  try {
    const { userId } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Réinitialiser les stats
    user.xp = 0;
    user.level = 1;
    user.streak = 0;
    user.badges = [];
    user.totalQuizzes = 0;
    user.correctAnswers = 0;
    user.totalAnswers = 0;
    
    // Réinitialiser les stats de catégorie
    Object.keys(user.categoryStats).forEach(cat => {
      user.categoryStats[cat] = { correct: 0, total: 0, xp: 0 };
    });
    
    await user.save();
    
    res.json({
      success: true,
      message: 'User stats reset successfully'
    });
    
  } catch (error) {
    console.error('Reset stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = {
  getUserStats,
  updateUserStats,
  getXPLeaderboard,
  resetUserStats
};