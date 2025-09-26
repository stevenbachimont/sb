import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

export class TemplateService {
  private static getTemplatesPath(): string {
    try {
      // Essayer le chemin relatif d'abord (développement)
      const relativePath = 'src/lib/server/templates';
      readFileSync(join(relativePath, 'contact-admin.html'), 'utf-8');
      return relativePath;
    } catch {
      try {
        // Essayer le chemin absolu (production)
        const absolutePath = join(dirname(fileURLToPath(import.meta.url)), 'templates');
        readFileSync(join(absolutePath, 'contact-admin.html'), 'utf-8');
        return absolutePath;
      } catch {
        // Dernier recours : chemin de build
        return join(process.cwd(), 'src/lib/server/templates');
      }
    }
  }

  /**
   * Charge un template et remplace les variables
   */
  static loadTemplate(templateName: string, variables: Record<string, string>): string {
    try {
      const templatesPath = this.getTemplatesPath();
      const templatePath = join(templatesPath, templateName);
      
      console.log(`Chargement du template: ${templatePath}`);
      console.log(`Variables:`, variables);
      
      let template = readFileSync(templatePath, 'utf-8');
      
      // Remplacer toutes les variables {{variable}} par leurs valeurs
      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        template = template.replace(regex, value);
      });
      
      console.log(`Template ${templateName} chargé avec succès`);
      return template;
    } catch (error) {
      console.error(`Erreur lors du chargement du template ${templateName}:`, error);
      console.error(`Chemin tenté: ${join(this.getTemplatesPath(), templateName)}`);
      
      // Fallback : utiliser les templates inline
      console.log(`Utilisation du template inline pour ${templateName}`);
      return this.getInlineTemplate(templateName, variables);
    }
  }

  /**
   * Charge un template HTML
   */
  static loadHtmlTemplate(templateName: string, variables: Record<string, string>): string {
    return this.loadTemplate(`${templateName}.html`, variables);
  }

  /**
   * Charge un template texte
   */
  static loadTextTemplate(templateName: string, variables: Record<string, string>): string {
    return this.loadTemplate(`${templateName}.txt`, variables);
  }

  /**
   * Formate la date actuelle
   */
  static getCurrentDate(): string {
    return new Date().toLocaleString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Templates inline en cas d'échec de chargement des fichiers
   */
  private static getInlineTemplate(templateName: string, variables: Record<string, string>): string {
    const templates = {
      'contact-admin.html': `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Nouveau message de contact</title>
    <style>
        body { font-family: Arial, sans-serif; background: #000; color: #FF69B4; }
        .header { background: #1a1a1a; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .field { margin: 10px 0; padding: 10px; background: rgba(86, 156, 214, 0.1); }
    </style>
</head>
<body>
    <div class="header">
        <h1>📧 Nouveau message de contact</h1>
        <p>stevenbachimont.com</p>
    </div>
    <div class="content">
        <div class="field"><strong>Nom:</strong> {{nom}} {{prenom}}</div>
        <div class="field"><strong>Email:</strong> {{email}}</div>
        <div class="field"><strong>Date:</strong> {{date}}</div>
        <div class="field"><strong>Message:</strong><br>{{message}}</div>
    </div>
</body>
</html>`,
      'contact-admin.txt': `NOUVEAU MESSAGE DE CONTACT
stevenbachimont.com

Nom: {{nom}} {{prenom}}
Email: {{email}}
Date: {{date}}

Message:
{{message}}`,
      'contact-client.html': `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Confirmation de réception</title>
    <style>
        body { font-family: Arial, sans-serif; background: #000; color: #FF69B4; }
        .header { background: #1a1a1a; padding: 20px; text-align: center; }
        .content { padding: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>✅ Message reçu</h1>
        <p>Merci pour votre intérêt !</p>
    </div>
    <div class="content">
        <p>Bonjour {{prenom}},</p>
        <p>J'ai bien reçu votre message et je vous recontacterai dans les plus brefs délais.</p>
        <p>Merci pour votre intérêt pour mes services !</p>
        <p>Cordialement,<br>Steven Bachimont</p>
    </div>
</body>
</html>`,
      'contact-client.txt': `MESSAGE REÇU - CONFIRMATION

Bonjour {{prenom}},

J'ai bien reçu votre message et je vous recontacterai dans les plus brefs délais.

Merci pour votre intérêt pour mes services !

Cordialement,
Steven Bachimont`
    };

    const template = templates[templateName];
    if (!template) {
      throw new Error(`Template inline ${templateName} non trouvé`);
    }

    // Remplacer les variables
    let result = template;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, value);
    });

    return result;
  }
}
