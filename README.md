# MonSite - Portfolio Web

Site web portfolio présentant des projets de développement web et des outils technologiques.

## 🎯 Fonctionnalités

- **Portfolio Web** : Projets de développement web
- **Outils & Technologies** : Présentation des compétences techniques
- **Formulaire de Contact** : Envoi d'emails automatique
- **Interface Responsive** : Optimisé pour tous les appareils

## 🚀 Installation et Démarrage

1. **Cloner le projet**
```bash
git clone <url-du-repo>
cd monsite
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer l'environnement**
```bash
# Option 1 : Script automatique
./setup-env.sh

# Option 2 : Manuel
cp env.example .env
# Puis éditez le fichier .env avec vos valeurs
```

4. **Lancer le serveur de développement**
```bash
npm run dev
```

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

## Configuration Email

Pour que les formulaires de contact et de réservation fonctionnent, vous devez configurer les variables d'environnement email :

1. Créez un fichier `.env` à la racine du projet
2. Ajoutez vos paramètres email :

```bash
# Configuration Gmail (recommandé)
EMAIL_USER=votre-email@gmail.com
EMAIL_APP_PASSWORD=votre-mot-de-passe-d-application
ADMIN_EMAIL=votre-email-admin@gmail.com

# Ou configuration SMTP personnalisé
# SMTP_HOST=smtp.votre-fournisseur.com
# SMTP_PORT=587
# SMTP_USER=votre-email@votre-fournisseur.com
# SMTP_PASS=votre-mot-de-passe
```

## 💳 Configuration Stripe (Paiements)

**⚠️ IMPORTANT** : Pour que les paiements fonctionnent, vous devez configurer Stripe.

### 1. Créer un compte Stripe
- Allez sur [stripe.com](https://stripe.com) et créez un compte
- Obtenez vos clés API sur le [dashboard Stripe](https://dashboard.stripe.com/apikeys)

### 2. Configurer les variables Stripe
Ajoutez ces variables dans votre fichier `.env` :

```bash
# Configuration Stripe (OBLIGATOIRE pour les paiements)
STRIPE_SECRET_KEY=sk_test_votre_cle_secrete_stripe
STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle_publique_stripe
STRIPE_WEBHOOK_SECRET=whsec_votre_webhook_secret
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle_publique_stripe
```

### 3. Configurer le webhook Stripe
1. Allez sur [dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
2. Ajoutez un endpoint : `https://votre-domaine.com/api/payment/webhook`
3. Sélectionnez les événements : `payment_intent.succeeded`, `payment_intent.payment_failed`

### 4. Guide complet
Consultez le [Guide de Déploiement Stripe](GUIDE_DEPLOIEMENT_STRIPE.md) pour plus de détails.

## Déploiement Docker

Le projet inclut une configuration Docker complète :

```bash
# Build de l'image
docker build -t monsite .

# Lancement avec docker-compose
docker-compose up -d
```

> **Note** : Les variables d'environnement peuvent être surchargées via docker-compose ou définies dans le Dockerfile.

## 🛠️ API de Gestion des Balades

### Récupérer les Balades
```bash
GET /api/balades
```

### Créer une Réservation
```bash
POST /api/balades/reservation
Content-Type: application/json

{
  "baladeId": 1,
  "prenom": "Jean",
  "nom": "Dupont",
  "email": "jean.dupont@email.com",
  "nombrePersonnes": 2,
  "message": "Message optionnel"
}
```

### Base de Données
Les données sont stockées dans `data/balades.db` avec les tables :
- `balades` : Informations des balades (date, heure, lieu, thème, places disponibles, etc.)
- `reservations` : Historique des réservations

### Gestion des Balades

#### Interface Web d'Administration
Accédez à l'interface d'administration sécurisée : `/admin`

**Code d'accès :** Configuré dans le fichier `.env` (variable `ADMIN_ACCESS_CODE`)
**Code par défaut :** `argentique2024`

**Fonctionnalités :**
- 🔐 Authentification par code
- 📋 Gestion complète des balades (ajouter, modifier, supprimer)
- 🗺️ **Gestion des parcours étape par étape** (ajout, modification, réorganisation, suppression)
- 📍 **Gestion des coordonnées GPS** (latitude/longitude pour chaque étape)
- 📅 Gestion des réservations
- 🔍 Recherche et filtrage
- 📊 Statistiques

#### Script de Maintenance (Alternative)
Pour gérer les balades en ligne de commande :

```bash
# Lancer le gestionnaire interactif
npm run manage-balades

# Ou directement
node scripts/manage-balades.js
```

**Fonctionnalités :**
- 📋 Lister toutes les balades
- ➕ Ajouter une nouvelle balade
- ✏️ Modifier une balade existante
- 🗑️ Supprimer une balade
- 📋 Voir les réservations

## 📚 Documentation

La documentation complète du projet est organisée par thématiques dans le dossier `docs/` :

### 🎯 **Documentation Principale**
- **[📚 Documentation Complète](./docs/README.md)** - Index principal de toute la documentation
- **[🔐 Administration](./docs/01-administration/)** - Interface d'administration et gestion
- **[💳 Paiements Stripe](./docs/02-paiements-stripe/)** - Configuration et déploiement des paiements
- **[🛡️ Sécurité & API](./docs/03-securite-api/)** - Sécurité des APIs et authentification
- **[🗺️ Système de Balades](./docs/04-systeme-balades/)** - Gestion des balades et statuts
- **[📧 Emails & Communication](./docs/05-emails-communication/)** - Templates d'emails et configuration
- **[📸 Captcha & Sécurité](./docs/06-captcha-securite/)** - Système de captcha photo
- **[🚀 Déploiement & Configuration](./docs/07-deploiement-configuration/)** - Guides de déploiement
- **[🧪 Tests & Qualité](./docs/08-tests-qualite/)** - Tests et qualité du code
- **[🔧 Corrections & Améliorations](./docs/09-corrections-ameliorations/)** - Corrections et améliorations
- **[👥 Guides Utilisateur](./docs/10-guides-utilisateur/)** - Documentation utilisateur final
- **[🏗️ Architecture Technique](./docs/11-architecture-technique/)** - Architecture et spécifications techniques

### 🚀 **Démarrage Rapide**
- **Développeurs** : Consultez [Architecture Technique](./docs/11-architecture-technique/) et [Déploiement](./docs/07-deploiement-configuration/)
- **Administrateurs** : Consultez [Administration](./docs/01-administration/) et [Système de Balades](./docs/04-systeme-balades/)
- **Utilisateurs** : Consultez [Guides Utilisateur](./docs/10-guides-utilisateur/)

## 🧪 Tests

Le projet inclut une suite de tests complète :

```bash
# Lancer tous les tests
npm test

# Tests spécifiques
npm run test:unit    # Tests unitaires
npm run test:e2e     # Tests end-to-end
npm run test:stripe  # Tests Stripe
```

### Couverture des Tests
- ✅ **Service de gestion des balades**
- ✅ **Validation des données**
- ✅ **Interface utilisateur**
- ✅ **API endpoints**
- ✅ **Intégration des composants**
- ✅ **💳 Tests Stripe** (paiements, webhooks, emails)

> **📚 Documentation détaillée** : Consultez [Tests & Qualité](./docs/08-tests-qualite/) pour la documentation complète des tests.
# sb
