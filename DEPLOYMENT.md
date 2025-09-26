# 🚀 Guide de Déploiement Docker

## 📋 Configuration Docker Compose

### Fichiers créés :
- `docker-compose.production.yml` - Configuration de production
- `Dockerfile` - Image Docker optimisée
- `nginx.conf` - Configuration Nginx avec SSL
- `deploy.sh` - Script de déploiement automatisé

## 🔧 Configuration sur le VPS

### 1. Installation des prérequis
```bash
# Sur votre VPS
sudo apt update
sudo apt install docker.io docker-compose nginx certbot python3-certbot-nginx
sudo systemctl enable docker
sudo systemctl start docker
```

### 2. Configuration des variables d'environnement
Créez un fichier `.env.production` sur votre VPS :
```bash
# Configuration email
VITE_EMAIL_HOST=smtp.gmail.com
VITE_EMAIL_PORT=587
VITE_EMAIL_USER=votre_email@gmail.com
VITE_EMAIL_PASS=votre_mot_de_passe_application
VITE_EMAIL_FROM=votre_email@gmail.com
```

### 3. Configuration SSL avec Let's Encrypt
```bash
# Obtenir le certificat SSL
sudo certbot --nginx -d stevenbachimont.com -d www.stevenbachimont.com

# Copier les certificats vers le dossier SSL
sudo cp /etc/letsencrypt/live/stevenbachimont.com/fullchain.pem ./ssl/cert.pem
sudo cp /etc/letsencrypt/live/stevenbachimont.com/privkey.pem ./ssl/key.pem
```

## 🚀 Déploiement

### Déploiement manuel
```bash
# Sur votre VPS
cd /root/sb
./deploy.sh
```

### Déploiement automatique via GitHub Actions
Le déploiement se lance automatiquement à chaque push sur `main` ou `steven`.

## 📊 Monitoring

### Vérifier le statut des conteneurs
```bash
docker-compose -f docker-compose.production.yml ps
```

### Voir les logs
```bash
docker-compose -f docker-compose.production.yml logs -f
```

### Redémarrer les services
```bash
docker-compose -f docker-compose.production.yml restart
```

## 🔒 Sécurité

- ✅ Utilisateur non-root dans le conteneur
- ✅ Headers de sécurité Nginx
- ✅ SSL/TLS avec Let's Encrypt
- ✅ Configuration de sécurité SSL
- ✅ Proxy sécurisé vers l'application

## 🌐 Architecture

```
Internet → Nginx (Port 80/443) → Portfolio App (Port 3000)
```

- **Nginx** : Reverse proxy avec SSL
- **Portfolio** : Application SvelteKit containerisée
- **Réseau Docker** : Communication sécurisée entre services
