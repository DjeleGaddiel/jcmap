flowchart TB
    subgraph CLIENT["📱 APPLICATION MOBILE"]
        RN[React Native / Expo]
        MAPS[React Native Maps]
        NOTIF[Push Notifications]
        STORE[Redux / Zustand]
    end

    subgraph BACKEND["☁️ BACKEND SERVICES"]
        API[API REST / GraphQL]
        AUTH[Authentication Service]
        GEO[Geolocation Service]
        PUSH[Push Notification Service]
        UPLOAD[File Upload Service]
    end

    subgraph DATABASE["🗄️ BASE DE DONNÉES"]
        POSTGRES[(PostgreSQL + PostGIS)]
        REDIS[(Redis Cache)]
        S3[(Cloudinary)]
    end

    subgraph EXTERNAL["🔌 SERVICES EXTERNES"]
        FIREBASE[Firebase Auth]
        FCM[Firebase Cloud Messaging]
        GMAPS[Google Maps API]
        SENTRY[Sentry Monitoring]
    end

    RN --> API
    RN --> MAPS
    RN --> NOTIF
    
    API --> AUTH
    API --> GEO
    API --> PUSH
    API --> UPLOAD
    
    AUTH --> FIREBASE
    GEO --> POSTGRES
    PUSH --> FCM
    UPLOAD --> S3
    
    API --> POSTGRES
    API --> REDIS
    
    MAPS --> GMAPS
    RN --> SENTRY