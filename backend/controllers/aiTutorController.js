const axios = require('axios');

const OLLAMA_URL = 'http://localhost:11434';
const MODEL = 'qwen2.5:0.5b-instruct-q4_K_M'; // MODÈLE OPTIMISÉ

// ==================== SYSTÈME EXPERT CODE ROUTE ====================
const ROAD_CODE_EXPERT = {
  // === FEUX TRICOLORES ===
  'feu rouge': {
    réponse: "Arrêt complet obligatoire avant la ligne",
    explication: "Le véhicule doit être totalement immobilisé. Même si l'intersection semble vide.",
    article: "Article R412-31",
    sanction: "135€ amende + 4 points retirés"
  },
  'feu orange': {
    réponse: "S'arrêter si possible en sécurité",
    explication: "Le feu orange annonce le rouge. Freinez si vous pouvez le faire sans danger.",
    article: "Article R412-31",
    sanction: "Franchissement = considéré comme feu rouge"
  },
  'feu vert': {
    réponse: "Passage autorisé",
    explication: "Vous pouvez traverser si la voie est libre. Vérifiez toujours les piétons.",
    article: "Article R412-31",
    sanction: "Aucune si respecté"
  },
  
  // === PANNEAUX ===
  'panneau stop': {
    réponse: "Arrêt complet obligatoire",
    explication: "Octogone rouge avec STOP blanc. Marquez l'arrêt, observez, cédez le passage, repartez.",
    article: "Article R415-6",
    sanction: "135€ + 4 points"
  },
  'cédez le passage': {
    réponse: "Céder la priorité",
    explication: "Triangle blanc bordé de rouge. Ralentissez et cédez si nécessaire. Pas d'arrêt obligatoire.",
    article: "Article R415-7",
    sanction: "135€ + 4 points"
  },
  
  // === VITESSES ===
  'vitesse en ville': {
    réponse: "50 km/h maximum",
    explication: "En agglomération. Zones 30: 30 km/h. Zones de rencontre: 20 km/h.",
    article: "Article R413-2",
    sanction: "Excès ≤20 km/h: 135€ + 1 point"
  },
  'vitesse sur route': {
    réponse: "80 km/h hors agglomération",
    explication: "Routes à chaussées séparées: 90 km/h. Présence cyclistes: 70 km/h.",
    article: "Article R413-3",
    sanction: "Excès ≤20 km/h: 135€ + 1 point"
  },
  'vitesse sur autoroute': {
    réponse: "130 km/h (sec) / 110 km/h (pluie)",
    explication: "Visibilité < 50m: 50 km/h. Jeunes conducteurs: 110 km/h.",
    article: "Article R413-4",
    sanction: "Excès ≤20 km/h: 135€ + 1 point"
  },
  
  // === RÈGLES DE BASE ===
  'distance de sécurité': {
    réponse: "2 secondes minimum",
    explication: "Règle des 2 secondes. Pluie: 4 secondes. Ville: adaptez à la circulation.",
    article: "Article R412-12",
    sanction: "135€ + 3 points"
  },
  'rond-point': {
    réponse: "Priorité aux véhicules déjà engagés",
    explication: "Cédez le passage à votre droite. Clignotant droit pour sortir.",
    article: "Article R415-10",
    sanction: "135€ + 4 points"
  },
  'ceinture de sécurité': {
    réponse: "Obligatoire pour tous",
    explication: "Conducteur et passagers (avant et arrière). Réduit risque décès de 50%.",
    article: "Article R412-1",
    sanction: "135€ + 3 points par personne"
  },
  'téléphone en conduisant': {
    réponse: "Interdit (même kit mains-libres)",
    explication: "Tenir le téléphone interdit. Écouteurs interdits. Augmente risque accident x3.",
    article: "Article R412-6-1",
    sanction: "135€ + 3 points"
  },
  'alcool au volant': {
    réponse: "0,5 g/L maximum (0,2 g/L jeunes)",
    explication: "Taux sanguin maximum. Jeunes conducteurs (<3 ans): 0,2 g/L.",
    article: "Article L234-1",
    sanction: "0,5-0,8 g/L: 135€ + 6 points"
  }
};

// Trouver la règle correspondante
const findRoadRule = (question) => {
  const q = question.toLowerCase().trim();
  
  for (const [key, rule] of Object.entries(ROAD_CODE_EXPERT)) {
    if (q.includes(key)) {
      return { ...rule, key };
    }
  }
  
  // Recherche par mots-clés
  const keywordMap = {
    'feu': 'feu rouge',
    'rouge': 'feu rouge',
    'orange': 'feu orange',
    'vert': 'feu vert',
    'stop': 'panneau stop',
    'cédez': 'cédez le passage',
    'ville': 'vitesse en ville',
    'agglomération': 'vitesse en ville',
    '50 km': 'vitesse en ville',
    'route': 'vitesse sur route',
    '80 km': 'vitesse sur route',
    'autoroute': 'vitesse sur autoroute',
    '130 km': 'vitesse sur autoroute',
    'distance': 'distance de sécurité',
    'secondes': 'distance de sécurité',
    'rond-point': 'rond-point',
    'giratoire': 'rond-point',
    'ceinture': 'ceinture de sécurité',
    'téléphone': 'téléphone en conduisant',
    'portable': 'téléphone en conduisant',
    'alcool': 'alcool au volant',
    '0.5': 'alcool au volant'
  };
  
  for (const [keyword, ruleKey] of Object.entries(keywordMap)) {
    if (q.includes(keyword)) {
      return { ...ROAD_CODE_EXPERT[ruleKey], key: ruleKey };
    }
  }
  
  return null;
};

// ==================== PROMPT OPTIMISÉ POUR QWEN2.5 ====================
const getQwenPrompt = (question, roadRule, correctAnswer = null) => {
  const ruleContext = roadRule ? `[CONNAISSANCE: ${roadRule.réponse}]` : '';
  const answerContext = correctAnswer ? `[RÉPONSE ATTENDUE: ${correctAnswer}]` : '';
  
  return `${ruleContext}
${answerContext}
---
RÔLE: Expert officiel du code de la route français.

QUESTION: "${question}"

INSTRUCTIONS:
1. Réponds UNIQUEMENT en français
2. Sois PRÉCIS et CONCIS
3. Donne la règle EXACTE du code
4. Maximum 3 phrases

FORMAT:
RÈGLE: [la règle officielle]
RAISON: [pourquoi cette règle]
APPLICATION: [comment faire]

RÉPONSE:`;
};

// ==================== TUTOR HELP OPTIMISÉ ====================
const tutorHelp = async (req, res) => {
  console.log("🚗 Expert Code Route - Qwen2.5");
  
  try {
    const questionText = req.body.userQuery || req.body.question || "";
    const correctAnswer = req.body.correctAnswer || "";
    
    if (!questionText.trim()) {
      return res.json({
        success: true,
        response: "👋 Expert code de la route à votre service. Posez votre question !",
        source: "expert-system",
        language: 'fr'
      });
    }
    
    console.log(`❓ Question: "${questionText}"`);
    
    // 1. Trouver la règle dans notre base
    const roadRule = findRoadRule(questionText);
    
    let qwenResponse = null;
    let source = "expert-base";
    
    // 2. Essayer Qwen2.5 si disponible
    try {
      console.log("⚡ Consultation Qwen2.5...");
      
      const prompt = getQwenPrompt(questionText, roadRule, correctAnswer);
      
      const result = await axios.post(
        `${OLLAMA_URL}/api/generate`,
        {
          model: MODEL,
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.0,      // Zéro créativité - maximum précision
            num_predict: 80,       // Court mais suffisant
            repeat_penalty: 1.0,
            top_p: 0.9,
            top_k: 40,
            stop: ["\n\n", "Question:", "QUESTION:"]
          }
        },
        { 
          timeout: 5000,  // Timeout court - Qwen est rapide !
          headers: { 'Content-Type': 'application/json' }
        }
      );
      
      const rawText = result.data?.response?.trim() || "";
      console.log("📥 Réponse Qwen:", rawText);
      
      // Validation simple
      if (rawText.length > 20 && !rawText.includes("désolé") && !rawText.includes("sorry")) {
        qwenResponse = rawText;
        source = "qwen2.5";
      }
      
    } catch (qwenError) {
      console.log("⚠️ Qwen non disponible:", qwenError.message);
    }
    
    // 3. Générer la réponse finale
    let finalResponse = "";
    
    if (qwenResponse) {
      // Nettoyer la réponse Qwen
      const cleanResponse = qwenResponse
        .replace(/.*RÉPONSE:\s*/i, '')
        .replace(/^[\s\-•]*/, '')
        .trim();
      
      finalResponse = `🚦 **Code de la Route - Expert**\n\n${cleanResponse}`;
      
      // Ajouter l'article si on connaît la règle
      if (roadRule) {
        finalResponse += `\n\n📚 *Référence: ${roadRule.article}*`;
      }
      
    } else if (roadRule) {
      // Réponse depuis notre base experte
      finalResponse = `🚦 **Code de la Route - Expert**\n\n**RÈGLE:** ${roadRule.réponse}\n\n**EXPLICATION:** ${roadRule.explication}\n\n**SANCTION:** ${roadRule.sanction}\n\n📚 *Référence: ${roadRule.article}*`;
      source = "expert-database";
      
    } else {
      // Réponse générale
      finalResponse = `🚦 **Code de la Route - Expert**\n\nPour cette question sur la conduite, je vous recommande de:\n\n1. Consulter le Code de la Route officiel\n2. Vous référer à votre livret d'auto-école\n3. Demander à votre moniteur agréé\n\n💡 *Conseil sécurité: Respectez toujours les distances et adaptez votre vitesse.*`;
      source = "safety-guide";
    }
    
    // 4. Retourner la réponse
    return res.json({
      success: true,
      response: finalResponse,
      model: source === "qwen2.5" ? MODEL : "expert-français",
      language: 'fr',
      source: source,
      confidence: roadRule ? "high" : "medium",
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("❌ Erreur:", error.message);
    
    return res.json({
      success: true,
      response: `⚠️ **Service Expert Temporairement Limité**\n\nRappel des règles essentielles:\n• Feu rouge = ARRÊT\n• Ville = 50 km/h MAX\n• STOP = arrêt complet\n• Ceinture = OBLIGATOIRE\n\n📞 Consultez votre auto-école pour plus de précisions.`,
      source: "safety-backup",
      language: 'fr'
    });
  }
};

// ==================== TEST QWEN2.5 ====================
const testOllama = async (req, res) => {
  console.log("🧪 Test Qwen2.5...");
  
  try {
    // Test connexion
    const connection = await axios.get(`${OLLAMA_URL}/api/tags`, { timeout: 5000 });
    
    const hasQwen = connection.data.models?.some(m => 
      m.name.includes('qwen2.5') || m.name.includes('qwen')
    );
    
    if (!hasQwen) {
      return res.json({
        success: false,
        status: "Qwen2.5 non installé",
        instruction: `Exécutez: ollama pull ${MODEL}`,
        alternative: "Utilisation base experte française"
      });
    }
    
    // Test génération
    const testResult = await axios.post(
      `${OLLAMA_URL}/api/generate`,
      {
        model: MODEL,
        prompt: "RÔLE: Expert code route. QUESTION: Feu rouge? RÉPONSE:",
        stream: false,
        options: { num_predict: 30, temperature: 0.0 }
      },
      { timeout: 3000 }
    );
    
    const testResponse = testResult.data?.response || "";
    const isFrench = /[àâäçéèêëîïôùûü]/i.test(testResponse);
    const isAboutRoad = /(arrêt|rouge|feu|obligatoire)/i.test(testResponse);
    
    res.json({
      success: true,
      status: "✅ Qwen2.5 Opérationnel",
      performance: {
        modèle: MODEL,
        français: isFrench ? "✅ Bon" : "⚠️ Faible",
        pertinence: isAboutRoad ? "✅ Pertinent" : "⚠️ Hors sujet",
        vitesse: "⚡ Rapide (modèle léger)"
      },
      test: testResponse.substring(0, 100),
      recommandation: "Parfait pour 8 Go RAM - Réponses instantanées",
      règles_maîtrisées: Object.keys(ROAD_CODE_EXPERT).length + " règles"
    });
    
  } catch (error) {
    console.error("Test error:", error.message);
    
    res.json({
      success: false,
      status: "Qwen2.5 non accessible",
      erreur: error.code === 'ECONNREFUSED' ? "Ollama non démarré" : error.message,
      solution: [
        "1. Lancez Ollama: ollama serve",
        `2. Installez: ollama pull ${MODEL}`,
        "3. Redémarrez votre application"
      ],
      backup: "✅ Système expert français actif sans Ollama"
    });
  }
};

module.exports = {
  tutorHelp,
  testOllama,
  ROAD_CODE_EXPERT
};