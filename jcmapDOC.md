# 📖 DOCUMENTATION COMPLÈTE - JCMAP

---

## 2. 🏗️ ARCHITECTURE TECHNIQUE DÉTAILLÉE

### 2.1 Stack Technologique

#### Frontend Mobile
| Technologie | Rôle | Justification |
|-------------|------|---------------|
| **React Native + Expo** | Framework mobile | Cross-platform (iOS + Android), large communauté |
| **TypeScript** | Langage | Typage fort, moins de bugs |
| **Zustand** | State management | Simple, performant, léger |
| **React Query** | Data fetching | Cache, synchronisation, optimistic updates |
| **React Native Maps** | Cartographie | Intégration native Google/Apple Maps |
| **Expo Notifications** | Push notifications | Gestion simplifiée des notifications |
| **Expo Location** | Géolocalisation | API unifiée pour GPS |

#### Backend
| Technologie | Rôle | Justification |
|-------------|------|---------------|
| **Node.js + NestJS** | API Backend | Scalable, TypeScript natif, architecture modulaire |
| **PostgreSQL + PostGIS** | Base de données | Extension géospatiale pour requêtes de proximité |
| **Redis** | Cache | Performance, sessions, rate limiting |
| **Firebase Auth** | Authentification | OAuth social, email/password, sécurisé |
| **Firebase Cloud Messaging** | Notifications push | Fiable, gratuit, cross-platform |
| **Cloudinary** | Stockage fichiers | Images événements, photos profils |
| **Docker + Kubernetes** | Déploiement | Scalabilité, CI/CD |

### 2.2 Structure de la Base de Données

```sql
-- UTILISATEURS
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firebase_uid VARCHAR(128) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    role ENUM('user', 'organizer', 'admin') DEFAULT 'user',
    church_id UUID REFERENCES churches(id),
    notification_radius INT DEFAULT 5, -- en km
    is_available BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ÉGLISES / ORGANISATIONS
CREATE TABLE churches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    denomination VARCHAR(100),
    address TEXT,
    location GEOGRAPHY(POINT, 4326),
    phone VARCHAR(20),
    email VARCHAR(255),
    website TEXT,
    logo_url TEXT,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ÉVÉNEMENTS D'ÉVANGÉLISATION
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    type ENUM('street', 'crusade', 'door_to_door', 'concert', 'movie', 'other'),
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    address TEXT NOT NULL,
    start_datetime TIMESTAMP NOT NULL,
    end_datetime TIMESTAMP NOT NULL,
    organizer_id UUID REFERENCES users(id),
    church_id UUID REFERENCES churches(id),
    max_participants INT,
    image_url TEXT,
    status ENUM('draft', 'published', 'cancelled', 'completed') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- INDEX GÉOSPATIAL pour recherches rapides
CREATE INDEX idx_events_location ON events USING GIST(location);

-- PARTICIPATIONS
CREATE TABLE event_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status ENUM('registered', 'confirmed', 'attended', 'cancelled'),
    registered_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- TÉMOIGNAGES / RETOURS
CREATE TABLE testimonies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id),
    user_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    decisions_count INT DEFAULT 0, -- nombre de conversions
    created_at TIMESTAMP DEFAULT NOW()
);

-- NOTIFICATIONS
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    type ENUM('new_event', 'reminder', 'update', 'testimony'),
    title VARCHAR(200),
    body TEXT,
    data JSONB,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 2.3 API Endpoints Principaux

```yaml
# AUTHENTIFICATION
POST   /api/auth/register          # Inscription
POST   /api/auth/login             # Connexion
POST   /api/auth/logout            # Déconnexion
GET    /api/auth/me                # Profil connecté

# ÉVÉNEMENTS
GET    /api/events                 # Liste (avec filtres géo)
GET    /api/events/:id             # Détail événement
POST   /api/events                 # Créer (organisateur)
PUT    /api/events/:id             # Modifier
DELETE /api/events/:id             # Supprimer

# Requête géospatiale exemple:
GET    /api/events?lat=48.85&lng=2.35&radius=5&type=street

# PARTICIPATIONS
POST   /api/events/:id/register    # S'inscrire
DELETE /api/events/:id/register    # Se désinscrire
GET    /api/events/:id/participants # Liste participants

# UTILISATEUR
GET    /api/users/me/events        # Mes événements
PUT    /api/users/me               # Modifier profil
PUT    /api/users/me/settings      # Paramètres notifications

# TÉMOIGNAGES
POST   /api/events/:id/testimonies # Ajouter témoignage
GET    /api/events/:id/testimonies # Liste témoignages
```

### 2.4 Requête Géospatiale (PostGIS)

```sql
-- Trouver tous les événements dans un rayon de 5km
SELECT 
    e.*,
    ST_Distance(
        e.location::geography,
        ST_MakePoint($longitude, $latitude)::geography
    ) / 1000 AS distance_km
FROM events e
WHERE 
    ST_DWithin(
        e.location::geography,
        ST_MakePoint($longitude, $latitude)::geography,
        $radius_meters
    )
    AND e.status = 'published'
    AND e.start_datetime > NOW()
ORDER BY distance_km ASC;
```

### 2.5 Système de Notifications Push

```javascript
// Notification automatique pour nouveaux événements
async function notifyNearbyUsers(event) {
    // Trouver utilisateurs dans le rayon
    const users = await db.query(`
        SELECT u.id, u.fcm_token, u.notification_radius
        FROM users u
        WHERE ST_DWithin(
            ST_MakePoint(u.last_longitude, u.last_latitude)::geography,
            $1::geography,
            u.notification_radius * 1000
        )
    `, [event.location]);
    
    // Envoyer notification à chaque utilisateur
    for (const user of users) {
        await fcm.send({
            token: user.fcm_token,
            notification: {
                title: "🙏 Nouvelle évangélisation près de vous !",
                body: `${event.title} - ${event.date}`
            },
            data: { eventId: event.id }
        });
    }
}
```

---

## 3. 🚀 MVP (Minimum Viable Product)

### 3.1 Fonctionnalités MVP (Phase 1 - 2-3 mois)

#### ✅ INCLUS dans le MVP
| Fonctionnalité | Priorité | Complexité |
|----------------|----------|------------|
| Inscription/Connexion (email + Google) | P0 | Moyenne |
| Carte avec événements géolocalisés | P0 | Haute |
| Liste des événements (tri par distance) | P0 | Faible |
| Détail d'un événement | P0 | Faible |
| Inscription à un événement | P0 | Faible |
| Notifications push (nouvel événement) | P0 | Moyenne |
| Création d'événement (organisateur) | P0 | Moyenne |
| Profil utilisateur basique | P1 | Faible |
| Filtres (rayon, type, date) | P1 | Moyenne |

#### ❌ EXCLUS du MVP (Phase 2+)
- Système de témoignages
- Chat/groupe de discussion
- Mode "disponible"
- Statistiques avancées
- Partage social
- Multi-langue
- Mode hors-ligne

### 3.2 User Stories MVP

```gherkin
# US1 - Voir événements proches
En tant qu'utilisateur chrétien
Je veux voir les évangélisations dans un rayon de 5km
Afin de pouvoir y participer

# US2 - Recevoir notifications
En tant qu'utilisateur
Je veux être notifié quand un événement est créé près de moi
Afin de ne pas manquer d'opportunités

# US3 - S'inscrire à un événement
En tant qu'utilisateur
Je veux m'inscrire à un événement
Afin que l'organisateur sache que je participe

# US4 - Créer un événement
En tant qu'organisateur d'église
Je veux publier une évangélisation
Afin d'attirer des participants
```

### 3.3 Planning MVP

```
SEMAINE 1-2: Setup & Auth
├── Configuration projet (Expo, NestJS)
├── Base de données PostgreSQL + PostGIS
├── Firebase Auth integration
└── Écrans login/register

SEMAINE 3-4: Core Features
├── API événements (CRUD)
├── Requêtes géospatiales
├── Écran carte avec markers
└── Liste événements

SEMAINE 5-6: Participations
├── Système d'inscription
├── Détail événement
├── Profil utilisateur
└── Mes événements

SEMAINE 7-8: Notifications & Polish
├── Firebase Cloud Messaging
├── Notifications nouveaux événements
├── Filtres et recherche
└── Tests et corrections

SEMAINE 9-10: Lancement
├── Tests utilisateurs beta
├── Corrections bugs
├── Déploiement stores
└── Marketing initial
```

### 3.4 Coût Estimatif MVP

| Poste | Coût estimé |
|-------|-------------|
| Développeur Full-Stack (2.5 mois) | 7 500 - 15 000 € |
| Designer UI/UX | 1 500 - 3 000 € |
| Serveurs (1ère année) | 600 - 1 200 € |
| Compte développeur Apple | 99 € /an |
| Compte développeur Google | 25 € (one-time) |
| APIs (Maps, etc.) | 0 - 500 € /an |
| **TOTAL MVP** | **10 000 - 20 000 €** |

---

## 4. 💰 MODÈLE ÉCONOMIQUE

### 4.1 Modèle Freemium Recommandé

#### 🆓 Version GRATUITE (Utilisateurs)
- Voir tous les événements sur la carte
- S'inscrire aux événements
- Recevoir notifications (rayon 5km max)
- Profil basique

#### 💎 Version PREMIUM "Évangéliste+" (4,99€/mois)
- Rayon de notifications étendu (jusqu'à 50km)
- Notifications prioritaires
- Badge "Évangéliste actif"
- Statistiques personnelles
- Accès anticipé aux événements

#### 🏛️ Version ÉGLISE/ORGANISATION (19,99€/mois)
- Création événements illimitée
- Page église personnalisée
- Statistiques détaillées (participants, conversions)
- Export données
- Support prioritaire
- Badge "Église vérifiée"

### 4.2 Autres Sources de Revenus

| Source | Description | Potentiel |
|--------|-------------|-----------|
| **Dons** | Bouton don intégré | Moyen |
| **Partenariats** | Librairies chrétiennes, formations | Moyen |
| **Publicité ciblée** | Événements chrétiens sponsorisés | Faible (à éviter) |
| **Formations** | Webinaires évangélisation | Moyen |
| **Affiliation** | Matériel d'évangélisation | Faible |

### 4.3 Projections Financières (Année 1-3)

```
ANNÉE 1 - Lancement
├── Utilisateurs: 5 000
├── Premium (2%): 100 × 4,99€ × 12 = 5 988 €
├── Églises (20): 20 × 19,99€ × 12 = 4 798 €
├── Dons estimés: 2 000 €
└── TOTAL: ~12 800 €

ANNÉE 2 - Croissance
├── Utilisateurs: 25 000
├── Premium (3%): 750 × 4,99€ × 12 = 44 910 €
├── Églises (100): 100 × 19,99€ × 12 = 23 988 €
├── Partenariats: 5 000 €
└── TOTAL: ~74 000 €

ANNÉE 3 - Maturité
├── Utilisateurs: 100 000
├── Premium (4%): 4000 × 4,99€ × 12 = 239 520 €
├── Églises (400): 400 × 19,99€ × 12 = 95 952 €
├── Partenariats: 20 000 €
└── TOTAL: ~355 000 €
```

### 4.4 Stratégie de Croissance

#### Phase 1: Acquisition (Mois 1-6)
- Lancement dans 3-5 villes pilotes
- Partenariat avec 10 églises locales
- Présence réseaux sociaux chrétiens
- Bouche-à-oreille communautaire

#### Phase 2: Expansion (Mois 7-12)
- Expansion nationale
- Programme ambassadeurs
- Témoignages vidéo
- SEO et content marketing

#### Phase 3: Consolidation (Année 2+)
- Expansion internationale (pays francophones)
- Nouvelles fonctionnalités
- API pour intégrations tierces
- Partenariats majeurs

### 4.5 KPIs à Suivre

| Métrique | Objectif An 1 |
|----------|---------------|
| Téléchargements | 10 000 |
| MAU (Monthly Active Users) | 5 000 |
| Taux de conversion Premium | 2% |
| Événements créés/mois | 100 |
| Inscriptions/événement moyen | 15 |
| Note App Store | > 4.5 ⭐ |
| NPS (Net Promoter Score) | > 50 |

---

## 📋 RÉSUMÉ EXÉCUTIF

**JCMAP** est une application mobile de géolocalisation d'événements d'évangélisation qui connecte les chrétiens aux opportunités missionnaires près de chez eux.

**Différenciateurs clés:**
- Première app dédiée spécifiquement à l'évangélisation
- Géolocalisation précise avec notifications intelligentes
- Communauté active et engagée
- Modèle freemium accessible

**Investissement MVP:** 10 000 - 20 000 €
**Time-to-market:** 2-3 mois
**ROI estimé:** Rentabilité dès l'année 2

**Prochaines étapes:**
1. Valider le concept avec 20 églises partenaires
2. Développer le MVP
3. Beta test avec 500 utilisateurs
4. Lancement officiel