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
		<h1 class="site-page__title">Contact</h1>
		<p class="site-page__lead">
			Collaboration, projet web, ou simplement échanger — écrivez-moi.
		</p>
	</div>

	<div class="contact-layout">
		<div class="contact-layout__main">
			{#if sent}
				<div class="success-container">
					<div class="success-message">
						<h3>Message envoyé</h3>
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
							rows="4"
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
								<path d="M8 6h8v10c0 2-1.5 3-4 3s-4-1-4-3V6z" />
								<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
								<path d="M10 9h4M10 12h4" />
								<path d="M12 6v10" />
							</svg>
							<span>Protégé par Honeypot</span>
						</div>
					</div>
				</form>
			{/if}
		</div>

		<figure class="contact-layout__media">
			<img
				src="/background/contact.jpg"
				alt="Portrait en noir et blanc d’un homme barbu au chapeau, souriant"
			/>
		</figure>
	</div>
</section>

<style>
	.contact-section {
		max-width: 9.5rem;
		margin: 0 auto;
		padding: 0.8rem 0.3rem 1.2rem;
		text-align: left;
		opacity: 0;
		transform: translateY(0.15rem);
		font-family: var(--main-font);
		color: #fff;
		background: #000;
		min-height: 100vh;
	}

	.contact-section.fade-in {
		opacity: 1;
		transform: none;
		transition:
			opacity 0.8s ease,
			transform 0.8s ease;
	}

	.contact-header {
		margin-bottom: 0.4rem;
	}

	.contact-layout {
		display: grid;
		grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.55fr);
		gap: 0.5rem;
		align-items: start;
	}

	.contact-layout__main {
		min-width: 0;
	}

	.contact-layout__media {
		margin: 0;
		width: 100%;
		max-width: 2.4rem;
		justify-self: end;
	}

	.contact-layout__media img {
		display: block;
		width: 100%;
		height: auto;
		object-fit: contain;
	}

	.contact-form {
		display: flex;
		flex-direction: column;
		gap: 0.16rem;
		align-items: stretch;
		max-width: 4.2rem;
	}

	.form-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.16rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.05rem;
	}

	label {
		color: #fff;
		font-weight: 400;
		font-size: 0.11rem;
		text-transform: uppercase;
		letter-spacing: 0.02em;
	}

	input,
	textarea {
		width: 100%;
		padding: 0.07rem 0.1rem;
		border-radius: 0;
		border: 1px solid rgba(255, 255, 255, 0.35);
		font-size: 0.14rem;
		line-height: 1.35;
		font-family: var(--main-font);
		background: transparent;
		color: #fff;
		outline: none;
		box-sizing: border-box;
		cursor: text;
	}

	input:focus,
	textarea:focus {
		border-color: #fff;
		background: rgba(255, 255, 255, 0.04);
	}

	input.error,
	textarea.error {
		border-color: #c44;
	}

	input::placeholder,
	textarea::placeholder {
		color: rgba(255, 255, 255, 0.4);
	}

	textarea {
		resize: vertical;
		min-height: 0.7rem;
		padding-top: 0.08rem;
	}

	.message-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
	}

	.char-count {
		font-size: 0.11rem;
		color: rgba(255, 255, 255, 0.5);
	}

	.error-text {
		color: #c44;
		font-size: 0.11rem;
	}

	.contact-btn {
		padding: 0.08rem 0.22rem;
		font-size: 0.13rem;
		font-family: var(--main-font);
		text-transform: uppercase;
		color: #fff;
		background: transparent;
		border: 1px solid #fff;
		border-radius: 0;
		cursor: pointer;
	}

	.contact-btn:hover:not(:disabled) {
		opacity: 0.7;
		transform: none;
		box-shadow: none;
		background: transparent;
	}

	.contact-btn:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	.error-message {
		border: 1px solid rgba(255, 255, 255, 0.35);
		color: #fff;
		padding: 0.16rem;
		text-align: left;
		font-size: 0.13rem;
	}

	.error-message h4 {
		margin: 0 0 0.08rem;
		font-size: 0.14rem;
		font-weight: 400;
		text-transform: uppercase;
	}

	.error-message p {
		margin: 0;
		font-size: 0.13rem;
		opacity: 0.85;
	}

	.success-container {
		text-align: left;
		padding: 0.2rem 0;
	}

	.success-message {
		border: 1px solid rgba(255, 255, 255, 0.35);
		padding: 0.25rem;
		max-width: 5rem;
	}

	.success-message h3 {
		color: #fff;
		margin-bottom: 0.12rem;
		font-size: 0.2rem;
		font-weight: 400;
		text-transform: uppercase;
	}

	.success-message p {
		color: rgba(255, 255, 255, 0.85);
		line-height: 1.4;
		margin-bottom: 0.12rem;
		font-size: 0.14rem;
	}

	.btn-reset {
		background: transparent;
		color: #fff;
		border: 1px solid #fff;
		padding: 0.12rem 0.28rem;
		border-radius: 0;
		cursor: pointer;
		font-family: var(--main-font);
		text-transform: uppercase;
		font-size: 0.13rem;
		margin-top: 0.15rem;
	}

	.btn-reset:hover {
		opacity: 0.7;
		transform: none;
		box-shadow: none;
		background: transparent;
	}

	.form-actions {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.16rem 0.22rem;
		margin-top: 0.1rem;
	}

	.honeypot-field {
		position: absolute;
		left: -9999px;
		width: 1px;
		height: 1px;
		overflow: hidden;
		opacity: 0;
		pointer-events: none;
	}

	.honeypot-badge {
		display: flex;
		align-items: center;
		gap: 0.08rem;
		font-size: 0.11rem;
		color: rgba(255, 255, 255, 0.4);
		text-transform: uppercase;
	}

	.honeypot-icon {
		color: rgba(255, 255, 255, 0.4);
	}

	@media (max-width: 700px) {
		.contact-layout {
			grid-template-columns: 1fr;
			gap: 0.35rem;
		}

		.contact-layout__media {
			max-width: 2.2rem;
			justify-self: start;
		}

		.form-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
