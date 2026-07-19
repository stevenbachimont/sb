<script lang="ts">
	import { onMount } from 'svelte';

	let isVisible = false;

	onMount(() => {
		setTimeout(() => {
			isVisible = true;
		}, 100);
	});
</script>

<section class="wait-section {isVisible ? 'fade-in' : ''}">
	<h2>Patientez, je viens !</h2>

	<p>
		Je suis en train de faire des mises à jour sur le site, revenez et vous verrez si c'est fini.
	</p>
</section>

<style>
	.wait-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 70dvh;
		padding: 1rem 0.3rem;
		text-align: center;
		color: #fff;
		font-family: var(--main-font);
	}

	.wait-section h2 {
		font-size: clamp(0.28rem, 6vw, 0.48rem);
		font-weight: 400;
		text-transform: uppercase;
		margin: 0 0 0.25rem;
	}

	.wait-section p {
		font-size: 0.14rem;
		max-width: 4.5rem;
		opacity: 0.85;
		line-height: 1.45;
		margin: 0;
	}

	.fade-in {
		animation: fadeIn 1s ease-in;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(0.15rem);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
