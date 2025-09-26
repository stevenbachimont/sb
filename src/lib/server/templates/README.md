# 📧 Templates d'Email

Ce dossier contient les templates d'email utilisés par le service de contact.

## 📁 Structure

```
templates/
├── contact-admin.html    # Template HTML pour l'admin
├── contact-admin.txt     # Template texte pour l'admin
├── contact-client.html   # Template HTML pour le client
├── contact-client.txt    # Template texte pour le client
└── README.md            # Ce fichier
```

## 🎨 Templates disponibles

### Contact Admin
- **Fichier HTML** : `contact-admin.html`
- **Fichier texte** : `contact-admin.txt`
- **Destinataire** : Steven Bachimont
- **Contenu** : Informations du message de contact

### Contact Client
- **Fichier HTML** : `contact-client.html`
- **Fichier texte** : `contact-client.txt`
- **Destinataire** : Client qui a envoyé le message
- **Contenu** : Confirmation de réception

## 🔧 Variables disponibles

Tous les templates supportent ces variables :

- `{{nom}}` - Nom du client
- `{{prenom}}` - Prénom du client
- `{{email}}` - Email du client
- `{{message}}` - Message du client
- `{{date}}` - Date et heure actuelles

## 🎨 Personnalisation

Pour modifier les templates :

1. **Éditez les fichiers HTML** pour changer l'apparence
2. **Éditez les fichiers TXT** pour changer la version texte
3. **Ajoutez de nouvelles variables** dans `templateService.ts`
4. **Testez** en envoyant un message de contact

## 📝 Exemple d'utilisation

```typescript
// Dans emailService.ts
const templateVariables = {
  nom: 'Dupont',
  prenom: 'Jean',
  email: 'jean.dupont@example.com',
  message: 'Bonjour, j\'aimerais discuter d\'un projet...',
  date: 'lundi 15 janvier 2024 à 14:30'
};

// Le template sera automatiquement rempli
```

## 🚀 Déploiement

Les templates sont automatiquement inclus dans le build Docker et déployés avec l'application.
