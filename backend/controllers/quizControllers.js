// quizControllers.js
const expressAsyncHandler = require("express-async-handler");
const Question = require("../models/questionModel");
const History = require("../models/historyModel");
const Proficiency = require("../models/proficiencyModel");
const User = require("../models/userModel");
const calculateXP = require("../utils/calculateXP");

// ====================== UTILS ======================

// Convertir la réponse correcte en nombre
function convertCorrectAnswer(correctAnswer) {
  if (correctAnswer === undefined || correctAnswer === null) return -1;
  if (typeof correctAnswer === "number") return correctAnswer;

  if (typeof correctAnswer === "string") {
    const trimmed = correctAnswer.trim().toUpperCase();
    if (trimmed === "A") return 0;
    if (trimmed === "B") return 1;
    if (trimmed === "C") return 2;
    if (trimmed === "D") return 3;

    const num = parseInt(trimmed, 10);
    if (!isNaN(num)) return num;
  }
  return -1;
}

// Questions de démonstration
function getDemoQuestions(language_id, category) {
  return [
    { _id: "demo_1", desc: "Red traffic light?", options: ["Stop", "Go", "Slow", "Speed"], category, language_id, image: null },
    { _id: "demo_2", desc: "Speed limit urban?", options: ["30 km/h", "50 km/h", "70 km/h", "90 km/h"], category, language_id, image: null },
    { _id: "demo_3", desc: "Turn signals?", options: ["Only night", "When changing lanes", "Never", "Bad weather"], category, language_id, image: null },
  ];
}

// Mettre à jour la compétence
const updateProficiency = async (uid, lang_id) => {
  try {
    const userHistory = await History.find({ user_id: uid, language_id: lang_id }).select("score_percent accuracy");
    if (!userHistory || userHistory.length === 0) return;

    let totalScore = 0, totalAccuracy = 0;
    userHistory.forEach(h => {
      totalScore += parseFloat(h.score_percent || 0);
      totalAccuracy += parseFloat(h.accuracy || 0);
    });

    const avgScore = totalScore / userHistory.length;
    const avgAccuracy = totalAccuracy / userHistory.length;
    const prof = (avgScore + avgAccuracy) / 2;

    let level;
    if (prof >= 90) level = `Master(${parseInt(prof)})`;
    else if (prof >= 80) level = `Candidate Master(${parseInt(prof)})`;
    else if (prof >= 70) level = `Expert(${parseInt(prof)})`;
    else if (prof >= 60) level = `Specialist(${parseInt(prof)})`;
    else level = `Apprentice(${parseInt(prof)})`;

    await Proficiency.findOneAndUpdate(
      { user_id: uid, language_id: lang_id },
      { proficiencyLevel: level },
      { upsert: true, new: true }
    );

    console.log(`✅ Proficiency updated for user ${uid}: ${level}`);
  } catch (err) {
    console.error("❌ Error updating proficiency:", err);
  }
};

// ====================== CONTROLLERS ======================

// Obtenir les questions
const getQuestions = expressAsyncHandler(async (req, res) => {
  const { language_id, category } = req.body;
  if (!language_id || !category) return res.status(400).json({ error: "Missing language_id or category" });

  const questions = await Question.find({ language_id, category }).select("-correct_answer");
  if (!questions || questions.length === 0) return res.status(200).json(getDemoQuestions(language_id, category));

  res.status(200).json(questions);
});

// Obtenir les réponses et calculer score + XP
const getAnswers = expressAsyncHandler(async (req, res) => {
  const { uid, pairs } = req.body;
  if (!uid || !pairs || pairs.length === 0) return res.status(400).json({ error: "Missing uid or pairs" });

  const user = await User.findById(uid);
  if (!user) return res.status(404).json({ error: "User not found" });

  // Initialiser stats
  user.xp = user.xp || 0;
  user.streak = user.streak || 0;
  user.badges = user.badges || [];

  let positiveMarks = 0, negativeMarks = 0, unAttempted = 0;
  const detailedPairs = [];

  let lang_id = null, level = null;

  for (const pair of pairs) {
    const question = await Question.findById(pair.objectId);
    if (!question) continue;

    lang_id = question.language_id;
    level = question.category;

    const correctAns = convertCorrectAnswer(question.correct_answer);
    const userAns = Number(pair.givenAnswer);

    let isCorrect = false, isAnswered = false;
    if (userAns === -1 || isNaN(userAns)) {
      unAttempted++;
    } else {
      isAnswered = true;
      isCorrect = userAns === correctAns;
      if (isCorrect) positiveMarks++; else negativeMarks++;
    }

    detailedPairs.push({
      objectId: pair.objectId,
      isCorrect,
      isAnswered,
      correctAnswer: correctAns,
      correctAnswerText: question.options && question.options[correctAns] ? question.options[correctAns] : "N/A",
      givenAnswer: userAns
    });
  }

  const totalMarks = pairs.length;
  const attempted = totalMarks - unAttempted;
  const accuracy = attempted > 0 ? (positiveMarks * 100) / attempted : 0;
  const score = positiveMarks - (negativeMarks / 2);
  const scorePercentage = totalMarks > 0 ? (score * 100) / totalMarks : 0;

  // Calculer XP via util
  const { totalXP, newStreak } = calculateXP(positiveMarks, totalMarks, user.streak);

  // Mettre à jour user
  user.xp += totalXP;
  user.streak = newStreak;
  user.level = Math.floor(user.xp / 100) + 1;

  // Gestion badges
  const badges = [...user.badges];
  if (user.xp >= 100 && !badges.includes("Beginner Badge")) badges.push("Beginner Badge");
  if (user.streak >= 3 && !badges.includes("On Fire Badge")) badges.push("On Fire Badge");
  if (positiveMarks >= 5 && !badges.includes("Quiz Master Badge")) badges.push("Quiz Master Badge");
  user.badges = badges;

  await user.save();

  // Créer l'historique
  if (lang_id) {
    await History.create({ user_id: uid, language_id: lang_id, score_percent: scorePercentage, accuracy });
    await updateProficiency(uid, lang_id);
  }

  const report = { totalMarks, corrected: positiveMarks, incorrected: negativeMarks, attempted, unAttempted, score, scorePercentage, accuracy };

  res.status(200).json({ success: true, pairs: detailedPairs, report, userStats: { xp: user.xp, streak: user.streak, level: user.level, badges: user.badges } });
});

// Obtenir langues distinctes
const getLanguages = expressAsyncHandler(async (req, res) => {
  const languages = await Question.distinct("language_id");
  const filtered = (languages || []).filter(l => l && l.trim() !== "");
  if (filtered.length === 0) return res.status(200).json(['CODE_DE_LA_ROUTE','FRENCH','ENGLISH','ARABIC']);
  res.status(200).json(filtered);
});

// Obtenir noms des tests (alias)
const getTestNames = expressAsyncHandler(async (req, res) => {
  const tests = await Question.distinct("language_id");
  const filtered = (tests || []).filter(t => t && t.trim() !== "");
  if (filtered.length === 0) return res.status(200).json(['CODE_DE_LA_ROUTE','FRENCH_DRIVING','ENGLISH_QUIZ','ARABIC_TEST','JAVASCRIPT_BASICS']);
  res.status(200).json(filtered);
});

// Soumettre quiz (simplifié)
const submitQuiz = expressAsyncHandler(async (req, res) => {
  const { userId, answers } = req.body;
  if (!userId || !answers || answers.length === 0) return res.status(400).json({ message: "Missing data" });

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  // Initialiser stats
  user.xp = user.xp || 0;
  user.streak = user.streak || 0;
  user.badges = user.badges || [];

  const positiveMarks = answers.filter(a => a.isCorrect).length;
  const totalMarks = answers.length;
  const { totalXP, newStreak } = calculateXP(positiveMarks, totalMarks, user.streak);

  user.xp += totalXP;
  user.streak = newStreak;
  user.level = Math.floor(user.xp / 100) + 1;

  // Gestion badges
  const badges = [...user.badges];
  if (user.xp >= 100 && !badges.includes("Beginner Badge")) badges.push("Beginner Badge");
  if (user.streak >= 3 && !badges.includes("On Fire Badge")) badges.push("On Fire Badge");
  if (positiveMarks >= 5 && !badges.includes("Quiz Master Badge")) badges.push("Quiz Master Badge");
  user.badges = badges;

  await user.save();

  res.status(200).json({ success: true, xpGained: totalXP, newStreak, level: user.level, totalXP: user.xp, badges: user.badges });
});

module.exports = { getQuestions, getAnswers, getLanguages, getTestNames, submitQuiz };