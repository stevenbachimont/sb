import { createTransport } from 'nodemailer';
import { env } from '$env/dynamic/private';

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

  constructor() {
    
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
      const { nom, prenom, email, message } = data;

      // Email pour l'administrateur
      const adminEmail = {
        from: `"Steven Bachimont" <${env.EMAIL_USER}>`,
        to: env.ADMIN_EMAIL || env.EMAIL_USER,
        subject: `Nouveau message de contact de ${prenom} ${nom}`,
        html: `
          <h2>Nouveau message de contact</h2>
          <p><strong>Nom:</strong> ${nom}</p>
          <p><strong>Prénom:</strong> ${prenom}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        `,
        text: `Nouveau message de contact\n\nNom: ${nom}\nPrénom: ${prenom}\nEmail: ${email}\nMessage: ${message}`
      };

      // Email de confirmation pour le client
      const clientEmail = {
        from: `"Steven Bachimont" <${env.EMAIL_USER}>`,
        to: email,
        subject: 'Confirmation de réception de votre message',
        html: `
          <h2>Message reçu</h2>
          <p>Bonjour ${prenom},</p>
          <p>J'ai bien reçu votre message et je vous recontacterai dans les plus brefs délais.</p>
          <p>Merci pour votre intérêt !</p>
          <p>Cordialement,<br>Steven Bachimont</p>
        `,
        text: `Bonjour ${prenom},\n\nJ'ai bien reçu votre message et je vous recontacterai dans les plus brefs délais.\n\nMerci pour votre intérêt !\n\nCordialement,\nSteven Bachimont`
      };

      await Promise.all([
        this.transporter.sendMail(adminEmail),
        this.transporter.sendMail(clientEmail)
      ]);
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'envoi des emails de contact:', error);
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
