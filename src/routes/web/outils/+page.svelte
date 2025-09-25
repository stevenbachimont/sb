<script lang="ts">
  import { onMount } from 'svelte';

  let isVisible = false;

  onMount(() => {
    setTimeout(() => { isVisible = true; }, 100);
  });
</script>

<section class="outils-section {isVisible ? 'fade-in' : ''}">
  <div class="outils-header">
    <h1>🛠️ Outils & Technologies</h1>
    <p>
      Découvrez les technologies et outils que j'utilise dans mes projets de développement.
    </p>
  </div>

  <div class="outils-content">
    <div class="technologies-grid">
      <div class="tech-category">
        <h3>Frontend</h3>
        <div class="tech-list">
          <div class="tech-item">
            <span class="tech-name">SvelteKit</span>
            <span class="tech-level">Expert</span>
          </div>
          <div class="tech-item">
            <span class="tech-name">React</span>
            <span class="tech-level">Avancé</span>
          </div>
          <div class="tech-item">
            <span class="tech-name">Vue.js</span>
            <span class="tech-level">Intermédiaire</span>
          </div>
          <div class="tech-item">
            <span class="tech-name">TypeScript</span>
            <span class="tech-level">Expert</span>
          </div>
        </div>
      </div>
      
      <div class="tech-category">
        <h3>Backend</h3>
        <div class="tech-list">
          <div class="tech-item">
            <span class="tech-name">Node.js</span>
            <span class="tech-level">Expert</span>
          </div>
          <div class="tech-item">
            <span class="tech-name">Express.js</span>
            <span class="tech-level">Avancé</span>
          </div>
          <div class="tech-item">
            <span class="tech-name">Python</span>
            <span class="tech-level">Intermédiaire</span>
          </div>
          <div class="tech-item">
            <span class="tech-name">PHP</span>
            <span class="tech-level">Intermédiaire</span>
          </div>
        </div>
      </div>
      
      <div class="tech-category">
        <h3>Bases de données</h3>
        <div class="tech-list">
          <div class="tech-item">
            <span class="tech-name">MongoDB</span>
            <span class="tech-level">Avancé</span>
          </div>
          <div class="tech-item">
            <span class="tech-name">PostgreSQL</span>
            <span class="tech-level">Intermédiaire</span>
          </div>
          <div class="tech-item">
            <span class="tech-name">SQLite</span>
            <span class="tech-level">Avancé</span>
          </div>
        </div>
      </div>
      
      <div class="tech-category">
        <h3>Outils & DevOps</h3>
        <div class="tech-list">
          <div class="tech-item">
            <span class="tech-name">Git</span>
            <span class="tech-level">Expert</span>
          </div>
          <div class="tech-item">
            <span class="tech-name">Docker</span>
            <span class="tech-level">Intermédiaire</span>
          </div>
          <div class="tech-item">
            <span class="tech-name">Vite</span>
            <span class="tech-level">Avancé</span>
          </div>
          <div class="tech-item">
            <span class="tech-name">Webpack</span>
            <span class="tech-level">Intermédiaire</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .outils-section {
    padding: 4rem 2rem;
    min-height: 100vh;
    background: #000000;
    color: white;
  }

  .outils-header {
    text-align: center;
    margin-bottom: 3rem;
  }

  .outils-header h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: white;
  }

  .outils-header p {
    font-size: 1.2rem;
    opacity: 0.9;
    max-width: 600px;
    margin: 0 auto;
  }

  .technologies-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .tech-category {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 15px;
    padding: 2rem;
    transition: transform 0.3s ease;
  }

  .tech-category:hover {
    transform: translateY(-5px);
  }

  .tech-category h3 {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
    color: white;
    text-align: center;
  }

  .tech-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .tech-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.8rem 1rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    transition: background 0.3s ease;
  }

  .tech-item:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .tech-name {
    font-weight: 500;
    color: white;
  }

  .tech-level {
    font-size: 0.8rem;
    padding: 0.3rem 0.6rem;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.2);
    color: white;
  }

  .fade-in {
    animation: fadeIn 1s ease-in;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 768px) {
    .outils-header h1 {
      font-size: 2rem;
    }
    
    .technologies-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
