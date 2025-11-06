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

			let template = readFileSync(templatePath, 'utf-8');

			// Remplacer toutes les variables {{variable}} par leurs valeurs
			Object.entries(variables).forEach(([key, value]) => {
				const regex = new RegExp(`{{${key}}}`, 'g');
				template = template.replace(regex, value);
			});
			return template;
		} catch (error) {
			console.error(`Erreur lors du chargement du template ${templateName}:`, error);
			console.error(`Chemin tenté: ${join(this.getTemplatesPath(), templateName)}`);
			const errorMessage = error instanceof Error ? error.message : String(error);
			throw new Error(`Template ${templateName} introuvable: ${errorMessage}`);
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
