# Quiz Hub - Code de la Route

## 📋 Description du Projet
Quiz Hub est une application web éducative full-stack développée pour l'apprentissage et la pratique du code de la route. L'application combine des quiz interactifs, un système de gamification avancé et un assistant IA intégré pour offrir une expérience d'apprentissage complète et engageante.

**Objectifs Principaux :**
- ✅ Créer une application MERN complète (MongoDB, Express, React, Node.js)
- ✅ Implémenter un système de quiz dynamique avec suivi de progression
- ✅ Développer une interface utilisateur intuitive avec Chakra UI
- ✅ Intégrer un système d'authentification sécurisé avec JWT
- ✅ Mettre en œuvre un système de gamification (XP, badges, classement)
- ✅ Intégrer un assistant IA pour l'explication des questions
- ✅ Garantir une architecture scalable et maintenable

## 🛠️ Stack Technologique

### **Backend:**
- **Node.js** - Environnement d'exécution JavaScript
- **Express.js** - Framework web pour Node.js
- **MongoDB** - Base de données NoSQL
- **Mongoose** - ODM pour MongoDB
- **JWT** - Authentification par tokens
- **Bcrypt** - Hashage des mots de passe
- **Multer** - Gestion des uploads de fichiers
- **Ollama** - IA locale pour l'assistant pédagogique

### **Frontend:**
- **React.js** - Bibliothèque JavaScript pour les interfaces
- **Chakra UI** - Système de design et composants UI
- **React Router** - Gestion des routes
- **Axios** - Client HTTP pour les appels API
- **ApexCharts** - Visualisation des données
- **React Confetti** - Animations de célébration
- **Howler.js** - Gestion des effets sonores

### **Base de Données:**
- **MongoDB Atlas** - Base de données cloud
- **Collections Principales:** users, questions, histories, proficiencies, quizscores

## 🚀 Fonctionnalités

### 🎯 Système de Quiz
- Quiz dynamique avec timer (20 secondes par question)
- Questions par catégorie et langue
- Feedback immédiat après chaque réponse
- Correction automatique avec explications
- Support multilingue (Français, Anglais, Arabe)

### 🏆 Gamification Avancée
- **Système XP:** Gain d'expérience basé sur les performances
- **Badges:** Déblocage de badges spéciaux
- **Streak:** Bonus pour les séries de bonnes réponses
- **Leaderboards:** Classements globaux et par langue
- **Niveaux:** Progression avec système de niveaux

### 🤖 Assistant IA Intégré
- Assistant pédagogique basé sur Ollama (IA locale)
- Explications détaillées des questions
- Suggestions contextuelles
- Fallback multilingue
- Confidentialité garantie (données locales)

### 📊 Analytics & Dashboard
- Graphiques de progression (ApexCharts)
- Statistiques détaillées par catégorie
- Historique des performances
- Visualisation des forces et faiblesses
- Dashboard personnel avec toutes les stats

### 👥 Gestion des Rôles
- **Étudiants:** Participation aux quiz, suivi progression
- **Enseignants:** Création de questions, upload de contenu
- **Sécurité:** Middleware de protection des routes

## 💻 Installation Locale

### Prérequis
- Node.js (v14 ou supérieur)
- MongoDB (local ou cluster Atlas)
- Git

### Étapes d'Installation

**1. Cloner le dépôt**
git clone https://github.com/wiem-hemdi/Quiz-Hub
cd Quiz-Hub
**2. Configurer le Backend**
cd backend
npm install
**3. Configurer le Frontend**
cd ../frontend
npm install
**4. Configurer les Variables d'Environnement**
MONGO_URI=votre_url_mongodb
JWT_SECRET=votre_secret_jwt
PORT=5000
NODE_ENV=development
**5. Démarrer les Serveurs**
cd backend
npm run dev
Le backend tourne sur http://localhost:5000

cd frontend
npx react-scripts start
Le frontend tourne sur http://localhost:3000

**6. Accéder à l'Application**
Ouvrez votre navigateur et allez sur : http://localhost:3000

## Ollama (Assistant IA)

**Installer Ollama**
curl -fsSL https://ollama.ai/install.sh | sh

**Télécharger un modèle**
ollama pull phi:2.7b

** Démarrer le serveur Ollama**
ollama serve

### Authentication Endpoints
# Signup : POST /user/
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "isTeacher": false
}


Réponse:

{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "123456789",
    "name": "John Doe",
    "email": "john@example.com",
    "isTeacher": false,
    "xp": 0,
    "level": 1
  }
}
### Quiz Endpoints :
GET /api/quiz/upload
[
  {
    "lang_id": "arabic",
    "category": "Code de la route",
    "desc": "ما هي سرعة القيادة القصوى داخل المدينة؟",
    "option1": "50 كم/س",
    "option2": "70 كم/س",
    "option3": "90 كم/س",
    "option4": "110 كم/س",
    "correct_answer": "0"
  },
  {
    "lang_id": "arabic",
    "category": "Code de la route",
    "desc": "ما معنى إشارة STOP؟",
    "option1": "توقف مؤقت",
    "option2": "توقف كامل",
    "option3": "استمر بحذر",
    "option4": "أعطِ الأولوية فقط",
    "correct_answer": "1"
  }
]

### Note: 

Ce projet a été développé dans le cadre d'un projet de fin d'études et sert de démonstration des compétences en développement full-stack avec les technologies MERN.

