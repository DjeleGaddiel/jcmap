# 🚀 Guide de Déploiement JCMAP

Ce guide vous accompagne dans le déploiement complet de l'application JCMAP pour une démonstration à vos prospects.

## 📋 Prérequis

- Compte GitHub (déjà configuré)
- Compte [Neon](https://neon.tech) (gratuit) - Base de données PostgreSQL
- Compte [Render](https://render.com) (gratuit) - Hébergement API
- Compte [Expo](https://expo.dev) (gratuit) - Build de l'application mobile

---

## Étape 1: Déployer la Base de Données (Neon)

### 1.1 Créer un compte Neon
1. Allez sur **https://neon.tech**
2. Cliquez sur "Sign Up" et créez un compte (avec GitHub de préférence)

### 1.2 Créer un nouveau projet
1. Cliquez sur "Create a project"
2. Nom du projet: `jcmap`
3. Région: `Frankfurt (eu-central-1)` (proche de l'Afrique)
4. Postgres version: Laissez par défaut

### 1.3 Récupérer les informations de connexion
Après la création, vous verrez une page avec votre **Connection String**. Elle ressemble à:
```
postgresql://username:password@ep-xxx.eu-central-1.aws.neon.tech/jcmap_db
```

Notez ces informations:
- **DATABASE_HOST**: `ep-xxx.eu-central-1.aws.neon.tech`
- **DATABASE_USER**: `username`
- **DATABASE_PASSWORD**: `password`
- **DATABASE_NAME**: `jcmap_db` (ou neondb par défaut)
- **DATABASE_PORT**: `5432`

> ⚠️ **Important**: Activez le "Pooled connection" pour de meilleures performances.

---

## Étape 2: Déployer l'API sur Render

### 2.1 Créer un compte Render
1. Allez sur **https://render.com**
2. Cliquez sur "Get Started for Free"
3. Connectez-vous avec votre compte GitHub

### 2.2 Créer un nouveau Web Service
1. Cliquez sur "New +" → "Web Service"
2. Connectez votre repository GitHub `jcmap`
3. Configurez le service:
   - **Name**: `jcmap-api`
   - **Region**: `Frankfurt (EU Central)`
   - **Branch**: `main`
   - **Root Directory**: `api`
   - **Runtime**: `Node`
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Plan**: `Free`

### 2.3 Configurer les variables d'environnement
Dans la section "Environment Variables", ajoutez:

| Clé | Valeur |
|-----|--------|
| `NODE_ENV` | `production` |
| `DATABASE_HOST` | (valeur de Neon) |
| `DATABASE_PORT` | `5432` |
| `DATABASE_USER` | (valeur de Neon) |
| `DATABASE_PASSWORD` | (valeur de Neon) |
| `DATABASE_NAME` | (valeur de Neon) |
| `JWT_SECRET` | (générez une clé secrète longue et aléatoire) |
| `CLOUDINARY_CLOUD_NAME` | (votre valeur) |
| `CLOUDINARY_API_KEY` | (votre valeur) |
| `CLOUDINARY_API_SECRET` | (votre valeur) |

### 2.4 Déployer
1. Cliquez sur "Create Web Service"
2. Attendez que le build se termine (5-10 minutes)
3. Votre API sera disponible sur: `https://jcmap-api.onrender.com`

### 2.5 Créer l'administrateur initial
Une fois déployé, vous devrez créer le super admin. Vous pouvez:
- Utiliser l'onglet "Shell" dans Render pour exécuter: `npm run seed:admin`
- Ou insérer manuellement dans la base de données Neon

---

## Étape 3: Configurer et Builder l'Application Mobile

### 3.1 Installer EAS CLI
```bash
npm install -g eas-cli
```

### 3.2 Se connecter à Expo
```bash
eas login
```
Si vous n'avez pas de compte Expo, créez-en un sur https://expo.dev

### 3.3 Configurer le projet EAS
```bash
cd ui
eas build:configure
```

### 3.4 Mettre à jour l'URL de production
Ouvrez `ui/src/services/apiClient.ts` et mettez à jour l'URL de production:
```typescript
const PRODUCTION_URL = "https://jcmap-api.onrender.com/api";
```
(Remplacez par l'URL réelle de votre API Render)

### 3.5 Générer l'APK pour la démo
```bash
# Build APK de preview (recommandé pour les démos)
eas build --platform android --profile preview
```

Le build prend environ 15-20 minutes. Une fois terminé, vous recevrez un lien pour télécharger l'APK.

### 3.6 (Optionnel) Build de production pour le Play Store
```bash
eas build --platform android --profile production
```

---

## Étape 4: Tester l'Application

### 4.1 Vérifier l'API
Testez que votre API fonctionne:
```bash
curl https://jcmap-api.onrender.com/api
```

### 4.2 Installer l'APK
1. Téléchargez l'APK généré par EAS
2. Transférez-le sur un appareil Android
3. Installez-le (activez "Sources inconnues" si nécessaire)
4. Lancez l'application et testez!

---

## ⚠️ Points d'attention

### Plan gratuit Render
- Le service s'endort après 15 minutes d'inactivité
- Le premier appel après une période d'inactivité peut prendre 30-60 secondes
- Solution: Si c'est problématique, passez au plan payant ($7/mois)

### Migration de base de données
- Avec `synchronize: true`, TypeORM créera automatiquement les tables
- En production, utilisez plutôt des migrations

### Sécurité
- Changez le `JWT_SECRET` pour quelque chose de long et aléatoire
- Ne commitez jamais de vraies credentials dans le code

---

## 📞 Support

En cas de problème, vérifiez:
1. Les logs de Render (onglet "Logs")
2. La connexion à la base de données Neon (onglet "Monitoring")
3. Les logs de build EAS (site expo.dev)

---

## Récapitulatif des URLs

| Service | URL |
|---------|-----|
| API Render | `https://jcmap-api.onrender.com` |
| Base de données Neon | `ep-xxx.eu-central-1.aws.neon.tech` |
| Dashboard Expo | `https://expo.dev` |
