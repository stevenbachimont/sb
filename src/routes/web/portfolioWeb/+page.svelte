<script lang="ts">
	import { onMount } from 'svelte';

	let isVisible = false;

	onMount(() => {
		setTimeout(() => {
			isVisible = true;
		}, 100);
	});
</script>

<section class="portfolio-section {isVisible ? 'fade-in' : ''}">
	<div class="portfolio-header">
		<h1>🚀 Portfolio Web</h1>
		<p>Découvrez mes projets de développement web et mes réalisations techniques.</p>
	</div>

	<div class="portfolio-content">
		<div class="projects-grid">
			<div class="project-card">
				<h3>Site Portfolio</h3>
				<p>Site web personnel développé avec SvelteKit, TypeScript et CSS moderne.</p>
				<div class="tech-stack">
					<span class="tech-tag">SvelteKit</span>
					<span class="tech-tag">TypeScript</span>
					<span class="tech-tag">CSS3</span>
				</div>
			</div>

			<div class="project-card">
				<h3>Applications Web</h3>
				<p>Développement d'applications web modernes avec des frameworks JavaScript.</p>
				<div class="tech-stack">
					<span class="tech-tag">React</span>
					<span class="tech-tag">Vue.js</span>
					<span class="tech-tag">Node.js</span>
				</div>
			</div>

			<div class="project-card">
				<h3>APIs REST</h3>
				<p>Conception et développement d'APIs RESTful pour des applications web.</p>
				<div class="tech-stack">
					<span class="tech-tag">Express.js</span>
					<span class="tech-tag">MongoDB</span>
					<span class="tech-tag">PostgreSQL</span>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.portfolio-section {
		padding: 4rem 2rem;
		min-height: 100vh;
		background: #000000;
	}

	.portfolio-header {
		text-align: center;
		margin-bottom: 3rem;
	}

	.portfolio-header h1 {
		font-size: 3rem;
		margin-bottom: 1rem;
		color: white;
	}

	.portfolio-header p {
		font-size: 1.2rem;
		color: #ccc;
		max-width: 600px;
		margin: 0 auto;
	}

	.projects-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	.project-card {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 15px;
		padding: 2rem;
		box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
		transition:
			transform 0.3s ease,
			box-shadow 0.3s ease;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.project-card:hover {
		transform: translateY(-5px);
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
	}

	.project-card h3 {
		font-size: 1.5rem;
		margin-bottom: 1rem;
		color: white;
	}

	.project-card p {
		color: #ccc;
		margin-bottom: 1.5rem;
		line-height: 1.6;
	}

	.tech-stack {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.tech-tag {
		background: #3498db;
		color: white;
		padding: 0.3rem 0.8rem;
		border-radius: 15px;
		font-size: 0.8rem;
		font-weight: 500;
	}

	.fade-in {
		animation: fadeIn 1s ease-in;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 768px) {
		.portfolio-header h1 {
			font-size: 2rem;
		}

		.projects-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
