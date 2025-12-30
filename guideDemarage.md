# ============================================
# 🚀 GUIDE DE DÉMARRAGE - JCMAP
# ============================================
# Prérequis: Node.js 18+, npm/yarn, Git
# ============================================

# ============================================
# 📱 PARTIE 1: APPLICATION MOBILE (React Native + Expo)
# ============================================

# 1. Créer le projet Expo
npx create-expo-app@latest jcmap-mobile --template blank-typescript
cd jcmap-mobile

# 2. Installer les dépendances principales
npx expo install expo-location                    # Géolocalisation
npx expo install expo-notifications               # Notifications push
npx expo install react-native-maps                # Cartes Google/Apple
npx expo install @react-navigation/native         # Navigation
npx expo install @react-navigation/native-stack   # Stack navigation
npx expo install @react-navigation/bottom-tabs    # Tab navigation
npx expo install expo-secure-store                # Stockage sécurisé

# 3. Installer les dépendances supplémentaires
npm install @tanstack/react-query                 # Data fetching
npm install zustand                               # State management
npm install axios                                 # HTTP client
npm install react-native-safe-area-context        # Safe area
npm install react-native-screens                  # Screens optimisés
npm install date-fns                              # Manipulation dates
npm install react-native-gesture-handler          # Gestures

# 4. Installer les dépendances Expo supplémentaires
npx expo install expo-image                       # Images optimisées
npx expo install expo-linear-gradient             # Dégradés
npx expo install expo-font                        # Polices custom
npx expo install expo-splash-screen               # Splash screen

# 5. Lancer l'application mobile
npx expo start

# Options de lancement:
# - Appuyer sur 'a' pour Android (émulateur ou appareil)
# - Appuyer sur 'i' pour iOS (simulateur Mac uniquement)
# - Scanner le QR code avec Expo Go (téléphone physique)


# ============================================
# ⚙️ PARTIE 2: BACKEND API (NestJS)
# ============================================

# 1. Créer un nouveau dossier et se déplacer à la racine
cd ..
mkdir jcmap-backend
cd jcmap-backend

# 2. Créer le projet NestJS
npx @nestjs/cli new . --package-manager npm --skip-git

# 3. Installer les dépendances pour la base de données
npm install @nestjs/typeorm typeorm pg           # PostgreSQL + TypeORM
npm install @nestjs/config                        # Configuration .env
npm install class-validator class-transformer     # Validation DTO

# 4. Installer les dépendances d'authentification
npm install @nestjs/passport passport             # Passport.js
npm install @nestjs/jwt passport-jwt              # JWT tokens
npm install firebase-admin                         # Firebase Auth
npm install bcrypt                                 # Hash passwords
npm install @types/bcrypt -D                       # Types bcrypt

# 5. Installer les dépendances pour les notifications
npm install firebase-admin                         # Firebase Cloud Messaging

# 6. Installer les dépendances utilitaires
npm install @nestjs/swagger swagger-ui-express    # Documentation API
npm install helmet                                 # Sécurité
npm install compression                            # Compression
npm install @nestjs/throttler                      # Rate limiting

# 7. Créer le fichier .env
cat > .env << EOF
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=jcmap_db

# JWT
JWT_SECRET=your_super_secret_jwt_key_here

# Firebase
FIREBASE_PROJECT_ID=your-firebase-project
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com

# App
PORT=3000
NODE_ENV=development
EOF

# 8. Lancer le backend en mode développement
npm run start:dev


# ============================================
# 🗄️ PARTIE 3: BASE DE DONNÉES POSTGRESQL + POSTGIS
# ============================================

# Option A: Avec Docker (recommandé)
docker run --name jcmap-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=jcmap_db \
  -p 5432:5432 \
  -d postgis/postgis:15-3.3

# Option B: Installation locale (macOS)
brew install postgresql@15
brew install postgis
brew services start postgresql@15

# Créer la base de données
psql -U postgres -c "CREATE DATABASE jcmap_db;"
psql -U postgres -d jcmap_db -c "CREATE EXTENSION postgis;"


# ============================================
# 🔥 PARTIE 4: FIREBASE (Console Web)
# ============================================

# 1. Aller sur https://console.firebase.google.com
# 2. Créer un nouveau projet "jcmap"
# 3. Activer Authentication > Sign-in method > Email/Password + Google
# 4. Aller dans Project Settings > Service Accounts
# 5. Générer une nouvelle clé privée (fichier JSON)
# 6. Copier les valeurs dans votre .env


# ============================================
# 📁 STRUCTURE DES DOSSIERS
# ============================================

# jcmap/
# ├── jcmap-mobile/          # App React Native
# │   ├── app/               # Écrans (avec Expo Router)
# │   ├── components/        # Composants réutilisables
# │   ├── hooks/             # Custom hooks
# │   ├── services/          # API calls
# │   ├── stores/            # Zustand stores
# │   ├── types/             # TypeScript types
# │   └── utils/             # Fonctions utilitaires
# │
# ├── jcmap-backend/         # API NestJS
# │   ├── src/
# │   │   ├── auth/          # Module authentification
# │   │   ├── events/        # Module événements
# │   │   ├── users/         # Module utilisateurs
# │   │   ├── churches/      # Module églises
# │   │   ├── notifications/ # Module notifications
# │   │   └── common/        # Shared (guards, filters, etc.)
# │   └── test/              # Tests
# │
# └── docker-compose.yml     # Services Docker


# ============================================
# 🐳 DOCKER COMPOSE (Tout en un)
# ============================================

cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  # Base de données PostgreSQL + PostGIS
  postgres:
    image: postgis/postgis:15-3.3
    container_name: jcmap-db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: your_password
      POSTGRES_DB: jcmap_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  # Cache Redis
  redis:
    image: redis:7-alpine
    container_name: jcmap-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  # Backend API (une fois Dockerfile créé)
  # api:
  #   build: ./jcmap-backend
  #   container_name: jcmap-api
  #   ports:
  #     - "3000:3000"
  #   depends_on:
  #     - postgres
  #     - redis
  #   environment:
  #     - DATABASE_HOST=postgres
  #     - REDIS_HOST=redis

volumes:
  postgres_data:
  redis_data:
EOF

# Lancer tous les services
docker-compose up -d

# Vérifier que tout fonctionne
docker-compose ps


# ============================================
# ✅ COMMANDES UTILES
# ============================================

# --- Mobile ---
cd jcmap-mobile
npx expo start                    # Lancer l'app
npx expo start --clear            # Lancer avec cache vidé
npx expo build:android            # Build Android (EAS)
npx expo build:ios                # Build iOS (EAS)

# --- Backend ---
cd jcmap-backend
npm run start:dev                 # Mode développement (hot reload)
npm run start:prod                # Mode production
npm run test                      # Lancer les tests
npm run build                     # Build pour production

# --- Database ---
npm run migration:generate        # Générer migration
npm run migration:run             # Appliquer migrations
npm run seed                      # Insérer données de test

# --- Docker ---
docker-compose up -d              # Lancer les services
docker-compose down               # Arrêter les services
docker-compose logs -f            # Voir les logs


# ============================================
# 🎉 C'EST PARTI !
# ============================================
# 
# 1. Terminal 1: docker-compose up -d (DB + Redis)
# 2. Terminal 2: cd jcmap-backend && npm run start:dev
# 3. Terminal 3: cd jcmap-mobile && npx expo start
#
# API disponible sur: http://localhost:3000
# Swagger docs sur: http://localhost:3000/api
# App mobile: Scanner le QR code avec Expo Go
# ============================================