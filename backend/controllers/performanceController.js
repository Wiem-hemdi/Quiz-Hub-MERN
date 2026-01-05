const expressAsyncHandler = require("express-async-handler");
const History = require("../models/historyModel");
const Proficiency = require("../models/proficiencyModel");

/**
 * Contrôleur pour l'analyse des performances utilisateur
 * Gère la récupération, l'analyse et la gestion des données de performance
 */

/**
 * getPerformance - Récupère l'historique des performances d'un utilisateur
 * pour une langue spécifique
 * 
 * @route GET /api/performance?uid=:uid&lang_id=:lang_id
 * @access Privé (via middleware JWT)
 */
const getPerformance = expressAsyncHandler(async (req, res) => {
  // Extraction des paramètres de requête
  let uid = req.query.uid;        // ID utilisateur
  let lang_id = req.query.lang_id; // ID langue (ex: "code-route-fr")
  
  try {
    // Recherche de l'historique avec filtres et tri chronologique
    const userHistory = await History.find({
      user_id: uid,
      language_id: lang_id,
    })
      .select("score_percent accuracy")  // Sélection optimisée des champs
      .sort({ createdAt: 1 });           // Tri par date croissante pour le graphique
    
    // Transformation des données pour le frontend
    const performanceArray = userHistory.map((history) => ({
      score_percent: history.score_percent,
      accuracy: history.accuracy,
    }));
    
    // Sérialisation en JSON pour la réponse
    const jsonContent = JSON.stringify(performanceArray);
    res.status(200).send(jsonContent);
    
  } catch (err) {
    // Gestion d'erreur avec code 500 (Internal Server Error)
    res.status(500);
    throw new Error(err);
  }
});

/**
 * getLeaderboard - Génère le classement des utilisateurs pour une langue
 * 
 * @route GET /api/performance/leaderboard?lang_id=:lang_id
 * @access Privé
 */
const getLeaderboard = expressAsyncHandler(async (req, res) => {
  const lang_id = req.query.lang_id;

  try {
    const leaderboard = await History.aggregate([
      // 1️⃣ Filtrer par langue
      {
        $match: { language_id: lang_id },
      },

      // 2️⃣ Grouper par utilisateur + meilleur score
      {
        $group: {
          _id: "$user_id",
          bestScore: { $max: "$score_percent" },
        },
      },

      // 3️⃣ Trier par score décroissant
      {
        $sort: { bestScore: -1 },
      },

      // 4️⃣ Limiter au TOP 10
      {
        $limit: 10,
      },

      // 5️⃣ Jointure avec la collection users
      {
        $lookup: {
          from: "users", // ⚠️ nom exact de ta collection User
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },

      // 6️⃣ Déplier le tableau user
      {
        $unwind: "$user",
      },

      // 7️⃣ Projection finale
      {
        $project: {
          _id: 0,
          uid: "$user._id",
          name: "$user.name",
          email: "$user.email",
          score_percent: "$bestScore",
        },
      },
    ]);

    res.status(200).json(leaderboard);
  } catch (err) {
    res.status(500);
    throw new Error(err);
  }
});

/**
 * getProficiency - Récupère les niveaux de compétence d'un utilisateur
 * 
 * @route GET /api/performance/proficiency?uid=:uid
 * @access Privé
 */
const getProficiency = expressAsyncHandler(async (req, res) => {
  const uid = req.query.uid;
  
  // Récupération directe sans transformation complexe
  const proficiencyData = await Proficiency.find({ user_id: uid }).select(
    "language_id proficiencyLevel"
  );
  
  // Retour direct du JSON (Express gère la sérialisation)
  res.status(200).json(proficiencyData);
});

/**
 * deleteHistory - Supprime l'historique de performance d'un utilisateur
 * et réinitialise son niveau de compétence
 * 
 * @route DELETE /api/performance/deletehistory?uid=:uid
 * @access Privé (admin ou utilisateur propriétaire)
 */
const deleteHistory = expressAsyncHandler(async (req, res) => {
  const uid = req.query.uid;
  
  try {
    // 1. Suppression de tous les historiques de l'utilisateur
    const isDeleted = await History.deleteMany({ user_id: uid });
    
    // 2. Réinitialisation des niveaux de compétence
    await Proficiency.updateMany(
      { user_id: uid },
      { proficiencyLevel: "Apprentice" }  // Niveau débutant par défaut
    );
    
    // Vérification et confirmation de la suppression
    if (isDeleted) {
      res.status(200).send("Performance History deleted for the user");
    }
    
  } catch (err) {
    res.status(500);
    throw new Error(err);
  }
});

// Exportation des fonctions du contrôleur
module.exports = {
  getPerformance,
  getLeaderboard,
  getProficiency,
  deleteHistory,
};