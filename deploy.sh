#!/bin/bash

# Script de déploiement pour VPS
set -e

echo "🚀 Démarrage du déploiement..."

# Variables
PROJECT_NAME="sb"
DOCKER_COMPOSE_FILE="docker-compose.yml"

# Arrêter les conteneurs existants
echo "📦 Arrêt des conteneurs existants..."
docker-compose -f $DOCKER_COMPOSE_FILE down || true

# Nettoyer les images inutilisées
echo "🧹 Nettoyage des images Docker..."
docker system prune -f

# Construire et démarrer les nouveaux conteneurs
echo "🔨 Construction et démarrage des conteneurs..."
docker-compose -f $DOCKER_COMPOSE_FILE up -d --build

# Vérifier le statut des conteneurs
echo "✅ Vérification du statut des conteneurs..."
docker-compose -f $DOCKER_COMPOSE_FILE ps

# Afficher les logs
echo "📋 Logs des conteneurs:"
docker-compose -f $DOCKER_COMPOSE_FILE logs --tail=50

echo "🎉 Déploiement terminé avec succès!"
echo "🌐 Votre site est accessible sur: https://stevenbachimont.com"
