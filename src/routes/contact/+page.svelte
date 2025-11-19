<script lang="ts">
	import { onMount } from 'svelte';

	let nom = '';
	let prenom = '';
	let email = '';
	let message = '';
	let sent = false;
	let error = '';
	let loading = false;
	let isVisible = false;
	
	// Protection anti-robots
	let honeypot = ''; // Champ caché pour attraper les robots
	let formStartTime = Date.now(); // Timestamp de début de remplissage

	// Validation côté client
	let errors = {
		nom: '',
		prenom: '',
		email: '',
		message: ''
	};

	onMount(() => {
		setTimeout(() => {
			isVisible = true;
		}, 100);
		// Initialiser le timestamp au chargement de la page
		formStartTime = Date.now();
	});

	function validateForm() {
		errors = {
			nom: '',
			prenom: '',
			email: '',
			message: ''
		};

		let isValid = true;

		// Validation du nom
		if (!nom.trim()) {
			errors.nom = 'Le nom est requis';
			isValid = false;
		} else if (nom.trim().length < 2) {
			errors.nom = 'Le nom doit contenir au moins 2 caractères';
			isValid = false;
		}

		// Validation du prénom
		if (!prenom.trim()) {
			errors.prenom = 'Le prénom est requis';
			isValid = false;
		} else if (prenom.trim().length < 2) {
			errors.prenom = 'Le prénom doit contenir au moins 2 caractères';
			isValid = false;
		}

		// Validation de l'email
		if (!email.trim()) {
			errors.email = "L'email est requis";
			isValid = false;
		} else if (!isValidEmail(email)) {
			errors.email = "L'adresse email n'est pas valide";
			isValid = false;
		}

		// Validation du message
		if (!message.trim()) {
			errors.message = 'Le message est requis';
			isValid = false;
		} else if (message.trim().length < 10) {
			errors.message = 'Le message doit contenir au moins 10 caractères';
			isValid = false;
		} else if (message.trim().length > 1000) {
			errors.message = 'Le message ne peut pas dépasser 1000 caractères';
			isValid = false;
		}

		return isValid;
	}

	function isValidEmail(email: string): boolean {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		loading = true;
		error = '';
		sent = false;

		// Calculer le temps de remplissage du formulaire
		const formFillTime = Date.now() - formStartTime;

		try {
			const response = await fetch('/api/contact', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					nom: nom.trim(),
					prenom: prenom.trim(),
					email: email.trim().toLowerCase(),
					message: message.trim(),
					// Protection anti-robots
					honeypot: honeypot,
					formFillTime: formFillTime
				})
			});

			const data = await response.json();

			if (response.ok) {
				console.log('Email envoyé avec succès:', data);
				sent = true;
				error = '';
				// Réinitialiser le formulaire
				nom = prenom = email = message = '';
				errors = { nom: '', prenom: '', email: '', message: '' };
			} else {
				console.error('Erreur API:', data.error);
				if (data.details && Array.isArray(data.details)) {
					error = data.details.join(', ');
				} else {
					error = data.error || "Erreur lors de l'envoi du message.";
				}
				sent = false;
			}
		} catch (err) {
			console.error('Erreur réseau:', err);
			error = 'Erreur de connexion. Veuillez vérifier votre connexion internet et réessayer.';
			sent = false;
		} finally {
			loading = false;
		}
	}

	function resetForm() {
		nom = prenom = email = message = '';
		error = '';
		sent = false;
		honeypot = '';
		formStartTime = Date.now();
		errors = { nom: '', prenom: '', email: '', message: '' };
	}
</script>

<section class="contact-section {isVisible ? 'fade-in' : ''}">
	<div class="contact-header">
		<h1>Contact</h1>
		<p>
			N'hésitez pas à me contacter pour toute demande de collaboration, projet web, ou simplement
			pour échanger. Je réponds rapidement à tous les messages !
		</p>
	</div>

	{#if sent}
		<div class="success-container">
			<div class="success-message">
				<h3>✅ Message envoyé avec succès !</h3>
				<p>Je vous recontacterai dans les plus brefs délais.</p>
				<p><strong>Merci de votre message !</strong></p>
				<button class="btn-reset" on:click={resetForm}> Envoyer un autre message </button>
			</div>
		</div>
	{:else}
		<form class="contact-form" on:submit={handleSubmit}>
			<div class="form-grid">
				<div class="form-group">
					<label for="prenom">Prénom *</label>
					<input
						id="prenom"
						type="text"
						bind:value={prenom}
						required
						placeholder="Votre prénom"
						class={errors.prenom ? 'error' : ''}
					/>
					{#if errors.prenom}
						<span class="error-text">{errors.prenom}</span>
					{/if}
				</div>

				<div class="form-group">
					<label for="nom">Nom *</label>
					<input
						id="nom"
						type="text"
						bind:value={nom}
						required
						placeholder="Votre nom"
						class={errors.nom ? 'error' : ''}
					/>
					{#if errors.nom}
						<span class="error-text">{errors.nom}</span>
					{/if}
				</div>
			</div>

			<div class="form-group">
				<label for="email">Email *</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					required
					placeholder="votre.email@exemple.com"
					class={errors.email ? 'error' : ''}
				/>
				{#if errors.email}
					<span class="error-text">{errors.email}</span>
				{/if}
			</div>

			<!-- Honeypot field - invisible pour les humains, visible pour les robots -->
			<div class="honeypot-field" aria-hidden="true">
				<label for="website">Ne pas remplir ce champ</label>
				<input
					id="website"
					type="text"
					bind:value={honeypot}
					tabindex="-1"
					autocomplete="off"
					aria-label="Ne pas remplir"
				/>
			</div>

			<div class="form-group">
				<label for="message">Message *</label>
				<textarea
					id="message"
					rows="5"
					bind:value={message}
					required
					placeholder="Décrivez votre projet, votre demande ou posez vos questions..."
					class={errors.message ? 'error' : ''}
				></textarea>
				<div class="message-info">
					{#if errors.message}
						<span class="error-text">{errors.message}</span>
					{:else}
						<span class="char-count">{message.length}/1000 caractères</span>
					{/if}
				</div>
			</div>

			{#if error}
				<div class="error-message">
					<h4>❌ Erreur</h4>
					<p>{error}</p>
				</div>
			{/if}

			<div class="form-actions">
				<button type="submit" class="contact-btn" disabled={loading}>
					{loading ? 'Envoi en cours...' : 'Envoyer le message'}
				</button>
			</div>

			<!-- Badge de protection Honeypot -->
			<div class="honeypot-badge" title="Formulaire protégé contre les robots">
				<svg
					class="honeypot-icon"
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<!-- Pot de miel -->
					<path d="M8 6h8v10c0 2-1.5 3-4 3s-4-1-4-3V6z" />
					<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
					<path d="M10 9h4M10 12h4" />
					<!-- Rayons de miel -->
					<path d="M12 6v10" />
				</svg>
				<span>Protégé par Honeypot</span>
			</div>
		</form>
	{/if}
</section>

<style>
	.contact-section {
		max-width: 700px;
		margin: 4rem auto;
		padding: 2rem;
		background: rgba(0, 0, 0, 0.8);
		border-radius: 16px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
		text-align: center;
		opacity: 0;
		transform: translateY(30px);
	}

	.contact-header {
		margin-bottom: 2rem;
	}

	.contact-section h1 {
		font-size: 2.5rem;
		margin-bottom: 1.5rem;
		color: var(--color-accent-1);
		background: linear-gradient(45deg, var(--color-accent-1), var(--color-accent-2));
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.contact-section p {
		font-size: 1.2rem;
		margin-bottom: 2.5rem;
		color: #fff;
		line-height: 1.6;
	}

	.contact-form {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		align-items: stretch;
	}

	.form-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.5rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.5rem;
	}

	label {
		color: #fff;
		font-weight: 600;
		font-size: 0.95rem;
	}

	input,
	textarea {
		width: 100%;
		padding: 0.8rem;
		border-radius: 8px;
		border: 2px solid rgba(255, 255, 255, 0.1);
		font-size: 1rem;
		background: rgba(255, 255, 255, 0.1);
		color: #fff;
		outline: none;
		transition: all 0.3s ease;
		box-sizing: border-box;
	}

	input:focus,
	textarea:focus {
		border-color: var(--color-accent-1);
		background: rgba(255, 255, 255, 0.15);
		box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.1);
	}

	input.error,
	textarea.error {
		border-color: #ff6b6b;
		background: rgba(255, 107, 107, 0.1);
	}

	input::placeholder,
	textarea::placeholder {
		color: rgba(255, 255, 255, 0.5);
	}

	textarea {
		resize: vertical;
		min-height: 120px;
	}

	.message-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
	}

	.char-count {
		font-size: 0.8rem;
		color: rgba(255, 255, 255, 0.6);
	}

	.error-text {
		color: #ff6b6b;
		font-size: 0.85rem;
		font-weight: 500;
	}

	.contact-btn {
		align-self: center;
		padding: 1rem 2.5rem;
		font-size: 1.1rem;
		color: #000;
		background: linear-gradient(45deg, var(--color-accent-1), var(--color-accent-2));
		border: none;
		border-radius: 8px;
		text-decoration: none;
		transition: all 0.3s ease;
		cursor: pointer;
		font-weight: 600;
		min-width: 200px;
	}

	.contact-btn:hover:not(:disabled) {
		background: linear-gradient(45deg, var(--color-accent-2), var(--color-accent-1));
		transform: translateY(-2px);
		box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
	}

	.contact-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}

	.error-message {
		background: rgba(255, 0, 0, 0.1);
		border: 1px solid rgba(255, 0, 0, 0.3);
		color: #ff6b6b;
		padding: 1rem;
		border-radius: 8px;
		text-align: left;
	}

	.error-message h4 {
		margin: 0 0 0.5rem 0;
		font-size: 1rem;
	}

	.error-message p {
		margin: 0;
		font-size: 0.9rem;
	}

	.success-container {
		text-align: center;
		padding: 2rem;
	}

	.success-message {
		background: rgba(0, 255, 0, 0.1);
		border: 1px solid rgba(0, 255, 0, 0.3);
		border-radius: 12px;
		padding: 2rem;
		max-width: 500px;
		margin: 0 auto;
	}

	.success-message h3 {
		color: #00ff00;
		margin-bottom: 1rem;
		font-size: 1.5rem;
	}

	.success-message p {
		color: rgba(255, 255, 255, 0.9);
		line-height: 1.6;
		margin-bottom: 1rem;
	}

	.btn-reset {
		background: linear-gradient(45deg, #00ff00, #00cc00);
		color: #000;
		border: none;
		padding: 0.8rem 1.5rem;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.3s ease;
		text-decoration: none;
		font-weight: 600;
		font-size: 0.95rem;
		margin-top: 1rem;
	}

	.btn-reset:hover {
		background: linear-gradient(45deg, #00cc00, #00ff00);
		transform: translateY(-2px);
		box-shadow: 0 4px 15px rgba(0, 255, 0, 0.4);
	}

	.form-actions {
		margin-top: 1rem;
	}

	/* Honeypot field - invisible pour les humains */
	.honeypot-field {
		position: absolute;
		left: -9999px;
		width: 1px;
		height: 1px;
		overflow: hidden;
		opacity: 0;
		pointer-events: none;
	}

	/* Badge de protection Honeypot */
	.honeypot-badge {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		margin-top: 1.5rem;
		padding: 0.5rem 1rem;
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.5);
		opacity: 0.7;
		transition: opacity 0.3s ease;
	}

	.honeypot-badge:hover {
		opacity: 1;
	}

	.honeypot-icon {
		color: rgba(255, 215, 0, 0.6);
		animation: pulse 2s ease-in-out infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 0.6;
		}
		50% {
			opacity: 1;
		}
	}

	/* Animation */
	.fade-in {
		opacity: 1;
		transform: translateY(0);
		animation: fadeIn 0.8s ease-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Responsive */
	@media (max-width: 768px) {
		.contact-section {
			margin: 2rem 1rem;
			padding: 1.5rem;
		}

		.contact-section h1 {
			font-size: 2rem;
		}

		.contact-section p {
			font-size: 1rem;
		}

		.form-grid {
			grid-template-columns: 1fr;
			gap: 1rem;
		}

		.contact-btn {
			padding: 0.9rem 2rem;
			font-size: 1rem;
			width: 100%;
			max-width: 300px;
		}
	}

	@media (max-width: 480px) {
		.contact-section {
			margin: 1rem 0.5rem;
			padding: 1rem;
		}

		.contact-section h1 {
			font-size: 1.8rem;
		}

		.contact-section p {
			font-size: 0.95rem;
		}

		input,
		textarea {
			padding: 0.7rem;
			font-size: 0.95rem;
		}

		.contact-btn {
			padding: 0.8rem 1.5rem;
			font-size: 0.95rem;
		}
	}
</style>
