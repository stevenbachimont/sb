<script lang="ts">
  import { onMount } from 'svelte';

  let isVisible = false;

  onMount(() => {
    setTimeout(() => { isVisible = true; }, 100);
  });
</script>

<section class="web-section {isVisible ? 'fade-in' : ''}">
  <div class="web-header">
    <h1>💻 Développement Web</h1>
    <p>
      Découvrez mes projets de développement web et les technologies que j'utilise.
    </p>
  </div>

  <div class="web-content">
    <div class="web-grid">
      <div class="web-card">
        <h3>Portfolio Web</h3>
        <p>Découvrez mes réalisations web et mes projets de développement.</p>
        <a href="/web/portfolioWeb" class="btn-primary">Voir le portfolio</a>
      </div>
      
      <div class="web-card">
        <h3>Outils & Technologies</h3>
        <p>Explorez les technologies et outils que j'utilise dans mes projets.</p>
        <a href="/web/outils" class="btn-primary">Découvrir les outils</a>
      </div>
    </div>
  </div>
</section>

<style>
  .web-section {
    padding: 4rem 2rem;
    text-align: center;
    background: #000000;
    color: white;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .web-header h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: white;
  }

  .web-header p {
    font-size: 1.2rem;
    margin-bottom: 3rem;
    opacity: 0.9;
  }

  .web-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    max-width: 800px;
    margin: 0 auto;
  }

  .web-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 15px;
    padding: 2rem;
    text-align: center;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .web-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }

  .web-card h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: white;
  }

  .web-card p {
    margin-bottom: 1.5rem;
    opacity: 0.9;
  }

  .btn-primary {
    display: inline-block;
    background: rgba(255, 255, 255, 0.2);
    color: white;
    padding: 0.8rem 1.5rem;
    border-radius: 25px;
    text-decoration: none;
    transition: all 0.3s ease;
    border: 2px solid rgba(255, 255, 255, 0.3);
  }

  .btn-primary:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }

  .fade-in {
    animation: fadeIn 1s ease-in;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 768px) {
    .web-header h1 {
      font-size: 2rem;
    }
    
    .web-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
