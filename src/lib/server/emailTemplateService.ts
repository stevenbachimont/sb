import emailTemplates from './emailTemplates.json';

export class EmailTemplateService {
  private templates: any;

  constructor() {
    this.templates = emailTemplates;
  }

  // Remplacer les variables dans un template
  private replaceVariables(template: string, variables: Record<string, any>): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{${key}}`;
      result = result.replace(new RegExp(placeholder, 'g'), value || '');
    }
    return result;
  }

  // Récupérer un template avec remplacement de variables
  getTemplate(category: string, type: string, variables: Record<string, any> = {}): any {
    const template = this.templates[category]?.[type];
    if (!template) {
      throw new Error(`Template non trouvé: ${category}.${type}`);
    }

    // Cloner le template et remplacer les variables
    const processedTemplate = JSON.parse(JSON.stringify(template));
    for (const [key, value] of Object.entries(processedTemplate)) {
      if (typeof value === 'string') {
        processedTemplate[key] = this.replaceVariables(value, variables);
      } else if (Array.isArray(value)) {
        processedTemplate[key] = value.map(item => 
          typeof item === 'string' ? this.replaceVariables(item, variables) : item
        );
      }
    }

    return processedTemplate;
  }

  // Récupérer les styles CSS
  getStyles(): any {
    return this.templates.styles;
  }

  // Générer le HTML d'un email avec le template
  generateEmailHTML(template: any, styles: any): string {
    return `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${template.title || 'Email Steven Bachimont'}</title>
        <style>
          body { ${styles.body} }
          .container { ${styles.container} }
          .header { ${styles.header} }
          .content { ${styles.content} }
          .highlight { ${styles.highlight} }
          .success { ${styles.success} }
          .details { ${styles.details} }
          .info-box { ${styles.infoBox} }
          .contact-info { ${styles.contactInfo} }
          .payment-info { ${styles.paymentInfo} }
          .footer { ${styles.footer} }
          .code-animation { ${styles.codeAnimation} }
          .code-line { ${styles.codeLine} }
          .line-number { ${styles.lineNumber} }
          .line-content { ${styles.lineContent} }
          .keyword { ${styles.keyword} }
          .function { ${styles.function} }
          .string { ${styles.string} }
          .comment { ${styles.comment} }
          .cursor { ${styles.cursor} }
          .typing-line-1 { ${styles.typingLine1} }
          .typing-line-2 { ${styles.typingLine2} }
          h1 { color: #000000; margin: 0; font-size: 24px; }
          h2 { color: #87CEEB; margin: 0 0 10px 0; }
          h3 { color: #87CEEB; margin-top: 0; }
          p { color: #FF69B4; margin: 5px 0; }
          strong { color: #87CEEB; }
          a { color: #FFD700; text-decoration: none; }
          ${styles.keyframes}
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${template.title || ''}</h1>
            <p>${template.subtitle || ''}</p>
          </div>
          <div class="content">
            ${this.generateContentHTML(template)}
          </div>
          ${template.footer ? `<div class="footer"><p>${template.footer}</p></div>` : ''}
        </div>
      </body>
      </html>
    `;
  }

  // Générer le contenu HTML selon le type de template
  private generateContentHTML(template: any): string {
    let html = '';

    // Ajouter l'animation de code si présente
    if (template.codeAnimation && template.codeLine1 && template.codeLine2) {
      html += `
        <div class="code-animation">
          <div class="code-line">
            <span class="line-number">1</span>
            <span class="line-content typing-line-1">
              <span class="keyword">console</span>.<span class="function">log</span>(<span class="string">'✅ Message reçu'</span>);
            </span>
          </div>
          <div class="code-line">
            <span class="line-number">2</span>
            <span class="line-content typing-line-2">
              <span class="comment">// Merci pour votre intérêt !</span>
              <span class="cursor"></span>
            </span>
          </div>
        </div>
      `;
    }

    // Ajouter la salutation
    if (template.greeting) {
      html += `<p>${template.greeting},</p>`;
    }

    // Ajouter le message principal
    if (template.mainMessage) {
      html += `<p>${template.mainMessage}</p>`;
    }

    // Ajouter les détails de l'expéditeur
    if (template.senderTitle && template.senderFormat) {
      html += `
        <div class="contact-info">
          <h3>${template.senderTitle}</h3>
          <p>${template.senderFormat.replace(/\n/g, '<br>')}</p>
        </div>
      `;
    }

    // Ajouter la date
    if (template.dateTitle && template.date) {
      html += `
        <div class="info-box">
          <h3>${template.dateTitle}</h3>
          <p>${template.date}</p>
        </div>
      `;
    }

    // Ajouter le message du client
    if (template.messageTitle) {
      html += `
        <div class="info-box">
          <h3>${template.messageTitle}</h3>
          <p>${template.message || 'Aucun message'}</p>
        </div>
      `;
    }

    // Ajouter la fermeture
    if (template.closing) {
      html += `<p>${template.closing}</p>`;
    }

    // Ajouter la signature
    if (template.signature) {
      html += `<p>${template.signature.replace(/\n/g, '<br>')}</p>`;
    }

    // Ajouter l'action requise
    if (template.actionRequired) {
      html += `<p><strong>Action requise :</strong> ${template.actionRequired}</p>`;
    }

    return html;
  }

  // Générer le texte brut d'un email
  generateEmailText(template: any): string {
    let text = '';

    if (template.title) text += `${template.title}\n`;
    if (template.subtitle) text += `${template.subtitle}\n\n`;

    if (template.greeting) text += `${template.greeting},\n\n`;

    if (template.mainMessage) text += `${template.mainMessage}\n\n`;

    if (template.senderTitle && template.senderFormat) {
      text += `${template.senderTitle}\n${template.senderFormat}\n\n`;
    }

    if (template.dateTitle && template.date) {
      text += `${template.dateTitle}\n${template.date}\n\n`;
    }

    if (template.messageTitle) {
      text += `${template.messageTitle}\n${template.message || 'Aucun message'}\n\n`;
    }

    if (template.closing) text += `${template.closing}\n\n`;

    if (template.signature) text += `${template.signature}\n\n`;

    if (template.actionRequired) text += `Action requise : ${template.actionRequired}\n\n`;

    if (template.footer) text += `---\n${template.footer}`;

    return text;
  }
}
