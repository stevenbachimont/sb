import { createTransport } from 'nodemailer';
import { env } from '$env/dynamic/private';
import { EmailTemplateService } from './emailTemplateService';

// Configuration du transporteur email
const createTransporter = () => {
  // Configuration pour Gmail (vous pouvez adapter pour d'autres fournisseurs)
  return createTransport({
    service: 'gmail',
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_APP_PASSWORD // Mot de passe d'application Gmail
    }
  });
};

// Configuration pour un serveur SMTP personnalisé (alternative)
const createCustomTransporter = () => {
  return createTransport({
    host: env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(env.SMTP_PORT || '587'),
    secure: false, // true pour 465, false pour les autres ports
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS
    }
  });
};

// Service d'envoi d'emails
export class EmailService {
  private transporter: any;
  private templateService: EmailTemplateService;

  constructor() {
    this.templateService = new EmailTemplateService();
    
    // Utiliser le transporteur Gmail par défaut, sinon le SMTP personnalisé
    if (env.EMAIL_USER && env.EMAIL_APP_PASSWORD) {
      console.log('Configuration email détectée:', {
        user: env.EMAIL_USER,
        password: env.EMAIL_APP_PASSWORD ? 'Configuré' : 'Manquant'
      });
      this.transporter = createTransporter();
    } else if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
      console.log('Configuration SMTP personnalisée détectée');
      this.transporter = createCustomTransporter();
    } else {
      console.error('Configuration email manquante:', {
        emailUser: env.EMAIL_USER || 'Non configuré',
        emailPassword: env.EMAIL_APP_PASSWORD ? 'Configuré' : 'Non configuré',
        smtpHost: env.SMTP_HOST || 'Non configuré',
        smtpUser: env.SMTP_USER || 'Non configuré',
        smtpPass: env.SMTP_PASS ? 'Configuré' : 'Non configuré'
      });
      throw new Error('Configuration email manquante. Veuillez configurer les variables d\'environnement.');
    }
  }




  // Envoyer un email de contact
  async sendContactMessage(data: { nom: string; prenom: string; email: string; message: string }): Promise<boolean> {
    try {
      console.log('📧 Début de l\'envoi d\'email de contact');
      const { nom, prenom, email, message } = data;
      const currentDate = new Date().toLocaleString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      // Variables pour les templates
      const variables = { nom, prenom, email, message, date: currentDate };
      
      console.log('📋 Variables de template:', variables);

      // Récupérer les templates
      console.log('📝 Chargement des templates...');
      const adminTemplate = this.templateService.getTemplate('contact', 'admin', variables);
      const clientTemplate = this.templateService.getTemplate('contact', 'client', variables);
      const styles = this.templateService.getStyles();
      console.log('✅ Templates chargés');

      // Email pour l'administrateur
      const adminEmail = {
        from: `"Steven Bachimont" <${env.EMAIL_USER}>`,
        to: env.ADMIN_EMAIL || env.EMAIL_USER,
        subject: adminTemplate.subject,
        html: this.templateService.generateEmailHTML(adminTemplate, styles),
        text: this.templateService.generateEmailText(adminTemplate)
      };

      // Email de confirmation pour le client
      const clientEmail = {
        from: `"Steven Bachimont" <${env.EMAIL_USER}>`,
        to: email,
        subject: clientTemplate.subject,
        html: this.templateService.generateEmailHTML(clientTemplate, styles),
        text: this.templateService.generateEmailText(clientTemplate)
      };

      console.log('📤 Envoi des emails...');
      await Promise.all([
        this.transporter.sendMail(adminEmail),
        this.transporter.sendMail(clientEmail)
      ]);
      console.log('✅ Emails envoyés avec succès');
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi des emails de contact:', error);
      console.error('❌ Stack trace:', error.stack);
      throw new Error('Erreur lors de l\'envoi des emails');
    }
  }


  // Vérifier la configuration
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Erreur de vérification de la connexion email:', error);
      return false;
    }
  }
}
