import { readFileSync } from 'fs';
import { join } from 'path';

export class TemplateService {
  private static templatesPath = 'src/lib/server/templates';

  /**
   * Charge un template et remplace les variables
   */
  static loadTemplate(templateName: string, variables: Record<string, string>): string {
    try {
      const templatePath = join(this.templatesPath, templateName);
      let template = readFileSync(templatePath, 'utf-8');
      
      // Remplacer toutes les variables {{variable}} par leurs valeurs
      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        template = template.replace(regex, value);
      });
      
      return template;
    } catch (error) {
      console.error(`Erreur lors du chargement du template ${templateName}:`, error);
      throw new Error(`Template ${templateName} introuvable`);
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
}
