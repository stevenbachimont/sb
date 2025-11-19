import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { EmailService } from '$lib/server/emailService';

// Fonction de validation d'email
function isValidEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

interface ContactData {
	nom: string;
	prenom: string;
	email: string;
	message: string;
	honeypot?: string; // Champ honeypot pour la protection anti-robots
	formFillTime?: number; // Temps de remplissage du formulaire en millisecondes
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		const data: ContactData = await request.json();

		// Protection anti-robots : vérifier le honeypot
		if (data.honeypot && data.honeypot.trim() !== '') {
			// Un robot a rempli le champ honeypot
			console.warn('⚠️ Tentative de soumission détectée comme robot (honeypot rempli)');
			return json(
				{
					error: 'Soumission rejetée'
				},
				{ status: 403 }
			);
		}

		// Protection anti-robots : vérifier le temps de remplissage
		// Un humain prend au moins 3 secondes pour remplir le formulaire
		// Les robots soumettent généralement en moins de 2 secondes
		if (data.formFillTime !== undefined && data.formFillTime < 2000) {
			console.warn('⚠️ Tentative de soumission détectée comme robot (temps de remplissage trop court)');
			return json(
				{
					error: 'Soumission rejetée'
				},
				{ status: 403 }
			);
		}

		// Validation des données
		const errors: string[] = [];

		if (!data.nom || data.nom.trim().length < 2) {
			errors.push('Le nom doit contenir au moins 2 caractères');
		}

		if (!data.prenom || data.prenom.trim().length < 2) {
			errors.push('Le prénom doit contenir au moins 2 caractères');
		}

		if (!data.email || !isValidEmail(data.email)) {
			errors.push("L'adresse email n'est pas valide");
		}

		if (!data.message || data.message.trim().length < 10) {
			errors.push('Le message doit contenir au moins 10 caractères');
		}

		if (errors.length > 0) {
			return json(
				{
					error: 'Données invalides',
					details: errors
				},
				{ status: 400 }
			);
		}

		// Nettoyage des données (exclure les champs de protection)
		const sanitizedData = {
			nom: data.nom.trim(),
			prenom: data.prenom.trim(),
			email: data.email.trim().toLowerCase(),
			message: data.message.trim()
		};

		// Envoi des emails
		const emailService = new EmailService();
		await emailService.sendContactMessage(sanitizedData);

		return json({
			success: true,
			message: 'Message envoyé avec succès'
		});
	} catch (error) {
		console.error("Erreur lors de l'envoi du message de contact:", error);

		// Gestion des erreurs spécifiques
		if (error instanceof Error) {
			if (error.message.includes('Configuration email manquante')) {
				return json(
					{
						error: "Configuration du serveur email manquante. Veuillez contacter l'administrateur."
					},
					{ status: 500 }
				);
			}

			if (error.message.includes("Erreur lors de l'envoi des emails")) {
				return json(
					{
						error: "Erreur lors de l'envoi du message. Veuillez réessayer plus tard."
					},
					{ status: 500 }
				);
			}
		}

		return json(
			{
				error: 'Erreur interne du serveur. Veuillez réessayer plus tard.'
			},
			{ status: 500 }
		);
	}
};
