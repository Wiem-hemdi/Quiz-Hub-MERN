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
- Sons feedback (correct/incorrect)


### 🏆 Gamification Avancée
- **Système XP:** Gain d'expérience basé sur les performances
- **Badges:** Déblocage de badges spéciaux
- **Streak:** Bonus pour les séries de bonnes réponses
- **Leaderboards:** Classements globaux et par langue
- **Niveaux:** Progression avec système de niveaux

### 🤖 Assistant IA Intégré
- Intégration d'**Ollama** (IA locale) au lieu d'APIs cloud coûteuses, garantissant :
      -  **Confidentialité** des données utilisateurs
      -  **Zéro coût** d'API
      -  **Personnalisation** totale des prompts
      -  **Disponibilité** offline
- Explications détaillées des questions
- Suggestions contextuelles
- Fallback multilingue
- Confidentialité garantie (données locales)

###  Analytics & Dashboard
-  Graphiques progression
-  Stats par langue/catégorie
-  Taux de réussite
-  Historique performances

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
git clone https://github.com/wiem-hemdi/Quiz-Hub-Mern
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
OLLAMA_URL=http://localhost:11434
AI_MODEL=qwen2.5:0.5b-instruct-q4_K_M


** Démarrer le serveur Ollama**
ollama serve
## 🏗️ Architecture

### Architecture Globale
```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                      │
│  ┌──────────────┐  ┌───────────────┐  ┌─────────────────┐ │
│  │ Auth Pages   │  │ Quiz System   │  │ Dashboard/Stats │ │
│  │ (Login/Sign) │  │ (TestPage)    │  │ (Analytics)     │ │
│  └──────┬───────┘  └───────┬───────┘  └────────┬────────┘ │
│         │                  │                     │          │
│         └──────────────────┴─────────────────────┘          │
│                            │                                 │
│                   ┌────────▼──────────┐                     │
│                   │  Axios HTTP Client │                     │
│                   └────────┬──────────┘                     │
└────────────────────────────┼──────────────────────────────┘
                             │
                    ┌────────▼──────────┐
                    │   API Gateway      │
                    │   (CORS, Auth)     │
                    └────────┬──────────┘
                             │
┌────────────────────────────▼──────────────────────────────┐
│                    BACKEND (Express.js)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │ Auth Routes  │  │ Quiz Routes  │  │ Performance     │ │
│  │ (JWT)        │  │ (CRUD)       │  │ Routes          │ │
│  └──────┬───────┘  └──────┬───────┘  └────────┬────────┘ │
│         │                  │                    │          │
│  ┌──────▼──────────────────▼────────────────────▼────────┐ │
│  │              Controllers Layer                         │ │
│  │  (Business Logic, XP Calculation, AI Integration)     │ │
│  └───────────────────────┬────────────────────────────────┘ │
│                          │                                  │
│  ┌───────────────────────▼────────────────────────────────┐ │
│  │              Models Layer (Mongoose)                   │ │
│  │  User │ Question │ History │ Proficiency │ QuizScore  │ │
│  └───────────────────────┬────────────────────────────────┘ │
└──────────────────────────┼────────────────────────────────┘
                           │
              ┌────────────▼────────────┐
              │   MongoDB Database      │
              │   (Collections + Index) │
              └─────────────────────────┘
                           
              ┌─────────────────────────┐
              │   Ollama AI Server      │
              │   (Local LLM - phi:2.7b)│
              └─────────────────────────┘
```

### Relations Base de Données (1-to-Many)
```
User (1) ──┬─── Question (N)     [user créateur]
           ├─── History (N)      [performances]
           ├─── Proficiency (N)  [compétences par langue]
           └─── QuizScore (N)    [scores détaillés]
```

## 📡 API Endpoints

### Authentication
```http
POST   /api/user/signup        # Inscription
POST   /api/user/login         # Connexion
GET    /api/user/profile       # Profil (protégé)
PUT    /api/user/profile       # Mise à jour profil
DELETE /api/user/profile       # Suppression compte
```

### Quiz
```http
GET    /quiz/languages         # Liste langues disponibles
GET    /quiz/test-names        # Liste tests disponibles
POST   /quiz/questions         # Récupérer questions (body: language_id, category)
POST   /quiz/answers           # Soumettre réponses + correction
POST   /quiz/upload            # Upload question (enseignants uniquement)
```

### Performance & Stats
```http
GET    /performance/history/:userId    # Historique performances
GET    /performance/leaderboard        # Classement global
GET    /performance/proficiency/:userId/:langId  # Niveau compétence
DELETE /performance/history/:userId    # Réinitialiser historique
```

### AI Tutor
```http
POST   /ai/tutor/explain      # Explication IA (body: question, userAnswer, correctAnswer)
```

### User Stats
```http
GET    /user-stats/:userId    # XP, badges, streak
### Note: 

Ce projet a été développé dans le cadre d'un projet de fin d'études et sert de démonstration des compétences en développement full-stack avec les technologies MERN en integrant un modèle intelligent.

