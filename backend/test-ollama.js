const axios = require('axios');

console.log('🎯 TEST FINAL INTÉGRATION IA');
console.log('=============================\n');

async function testComplet() {
  try {
    console.log('1️⃣ Test Ollama direct...');
    const ollamaTest = await axios.post('http://localhost:11434/api/generate', {
      model: 'phi:2.7b',
      prompt: 'Tu es un moniteur d\'auto-école. Explique le feu rouge.',
      stream: false,
      options: { temperature: 0.7 }
    });
    console.log('✅ Réponse Ollama:', ollamaTest.data.response.substring(0, 100) + '...\n');

    console.log('2️⃣ Test API Quiz Hub...');
    const quizHubTest = await axios.post('http://localhost:5000/api/ai/tutor-help', {
      question: "Que faire à un feu rouge ?",
      options: ["Accélérer", "S'arrêter", "Ralentir", "Contourner"],
      userQuery: "Pourquoi l'arrêt complet est obligatoire ?",
      correctAnswer: "S'arrêter"
    }, {
      timeout: 20000
    });

    console.log('✅ Réponse Quiz Hub:');
    console.log('='.repeat(60));
    console.log(quizHubTest.data.response);
    console.log('='.repeat(60));
    
    console.log('\n🎉 SUCCÈS TOTAL ! L\'assistant IA est pleinement opérationnel !');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.log('Stack:', error.stack);
  }
}

testComplet();