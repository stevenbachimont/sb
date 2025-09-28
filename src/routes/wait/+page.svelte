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
		height: 10vh;
	}

	.wait-section h2 {
		font-size: 4rem;
		margin-bottom: 1rem;
	}

	.wait-section p {
		font-size: 1rem;
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
</style>
