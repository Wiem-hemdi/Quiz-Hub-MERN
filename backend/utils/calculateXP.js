// backend/utils/calculateXP.js

/**
 * Calcule l'XP gagné pour un quiz
 * @param {number} correctAnswers - Nombre de réponses correctes
 * @param {number} totalQuestions - Nombre total de questions
 * @param {number} streak - Streak actuel
 * @returns {object} - XP gagné et nouveau streak
 */
function calculateXP(correctAnswers, totalQuestions, streak) {
  const baseXP = correctAnswers * 10; // 10 XP par bonne réponse
  let bonusXP = 0;

  if (streak >= 5 && streak < 10) bonusXP = 20;
  else if (streak >= 10) bonusXP = 50;

  const totalXP = baseXP + bonusXP;
  const newStreak = correctAnswers === totalQuestions ? streak + 1 : 0;

  return { totalXP, newStreak };
}

module.exports = calculateXP;
