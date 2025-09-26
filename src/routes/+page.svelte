<script lang="ts">
  import { onMount } from 'svelte';
  import codeExamples from '$lib/codeLines.json';

  type Fragment = { text: string; type: string };
  type CodeLine = Fragment[];
  type CodeExample = CodeLine[][];

  let displayedLines: CodeLine[] = [];
  let isVisible = false;
  let showCode = true;
  let showVideo = true;
  let webHover = false;
  let isTyping = false;
  let isPaused = false;
  let userControl = false;
  let currentLineIndex = 0;
  let mobileInput: HTMLInputElement;
  let currentCharIndex = 0;
  let animationLoop: Promise<void> | null = null;

  function getRandomExample(): CodeLine[] {
    // codeExamples est un tableau d'exemples, chaque exemple est un tableau de lignes
    const example = codeExamples[Math.floor(Math.random() * codeExamples.length)];
    return example;
  }

  onMount(() => {
    isVisible = true;
    startAnimation();
  });

  function startAnimation() {
    if (!animationLoop) {
      animationLoop = typeCodeLoop();
    }
  }

  function handleCodeClick() {
    console.log('Clic détecté!', { userControl, isPaused });
    if (!userControl) {
      // Prendre le contrôle
      console.log('Passage en mode interactif');
      isPaused = true;
      userControl = true;
      isTyping = false;
      // Focus automatique pour pouvoir taper
      setTimeout(() => {
        const codeBg = document.querySelector('.code-bg') as HTMLElement;
        if (codeBg) {
          codeBg.focus();
          // Forcer l'apparition du clavier sur mobile
          if (('ontouchstart' in window || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) && mobileInput) {
            // Délai pour s'assurer que l'input est visible
            setTimeout(() => {
              mobileInput.style.position = 'fixed';
              mobileInput.style.top = '50%';
              mobileInput.style.left = '50%';
              mobileInput.style.transform = 'translate(-50%, -50%)';
              mobileInput.style.opacity = '0.01';
              mobileInput.style.pointerEvents = 'auto';
              mobileInput.focus();
              mobileInput.click();
            }, 50);
          }
          console.log('Focus appliqué');
        }
      }, 100);
    } else {
      // Reprendre l'animation automatique
      console.log('Retour à l\'animation automatique');
      userControl = false;
      isPaused = false;
      // Remettre l'input mobile en position cachée
      if (mobileInput) {
        mobileInput.style.position = 'absolute';
        mobileInput.style.left = '-9999px';
        mobileInput.style.opacity = '0';
        mobileInput.style.pointerEvents = 'none';
        mobileInput.blur();
      }
      startAnimation();
    }
  }

  function handleMobileInput(event: Event) {
    if (userControl && event.target) {
      const input = event.target as HTMLInputElement;
      const value = input.value;
      
      if (value.length > 0) {
        // Traiter chaque caractère tapé
        const lastChar = value[value.length - 1];
        handleUserInput(lastChar);
        // Vider l'input pour le prochain caractère
        input.value = '';
      }
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (userControl) {
      // Empêcher le scroll avec la barre espace
      if (event.key === ' ') {
        event.preventDefault();
        addCharacter(' ');
        return;
      }
      
      // Gérer Ctrl+C, Ctrl+V, Ctrl+A
      if (event.ctrlKey || event.metaKey) {
        if (event.key === 'c') {
          // Copier tout le code affiché
          copyAllCode();
          event.preventDefault();
          return;
        } else if (event.key === 'v') {
          // Coller du texte
          handlePaste();
          event.preventDefault();
          return;
        } else if (event.key === 'a') {
          // Sélectionner tout
          selectAllCode();
          event.preventDefault();
          return;
        }
      }
      
      if (event.key === 'Escape') {
        // Reprendre l'animation automatique
        userControl = false;
        isPaused = false;
        startAnimation();
      } else if (event.key === 'Enter') {
        // Nouvelle ligne
        addNewLine();
      } else if (event.key === 'Backspace') {
        // Supprimer le dernier caractère
        removeLastCharacter();
      } else if (event.key.length === 1) {
        // Ajouter un caractère
        addCharacter(event.key);
      }
    }
  }

  function addCharacter(char: string) {
    if (displayedLines.length === 0) {
      displayedLines = [[]];
    }
    
    const lastLine = displayedLines[displayedLines.length - 1];
    if (lastLine.length === 0) {
      lastLine.push({ text: char, type: 'text' });
    } else {
      const lastFragment = lastLine[lastLine.length - 1];
      lastFragment.text += char;
    }
    
    // Appliquer la coloration syntaxique à la ligne
    applySyntaxHighlighting(lastLine);
    displayedLines = [...displayedLines];
  }

  function removeLastCharacter() {
    if (displayedLines.length > 0) {
      const lastLine = displayedLines[displayedLines.length - 1];
      if (lastLine.length > 0) {
        const lastFragment = lastLine[lastLine.length - 1];
        if (lastFragment.text.length > 1) {
          lastFragment.text = lastFragment.text.slice(0, -1);
        } else {
          lastLine.pop();
        }
        // Appliquer la coloration syntaxique après suppression
        applySyntaxHighlighting(lastLine);
        displayedLines = [...displayedLines];
      }
    }
  }

  function addNewLine() {
    displayedLines = [...displayedLines, []];
  }

  function copyAllCode() {
    // Convertir le code affiché en texte brut
    const codeText = displayedLines.map(line => 
      line.map(frag => frag.text).join('')
    ).join('\n');
    
    // Copier dans le presse-papiers
    navigator.clipboard.writeText(codeText).then(() => {
      console.log('Code copié dans le presse-papiers');
      showNotification('Code copié !');
    }).catch(err => {
      console.error('Erreur lors de la copie:', err);
    });
  }

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      console.log('Texte collé:', text);
      
      // Diviser le texte en lignes et l'ajouter
      const lines = text.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (i === 0) {
          // Première ligne : ajouter au contenu existant
          if (displayedLines.length === 0) {
            displayedLines = [[]];
          }
          const lastLine = displayedLines[displayedLines.length - 1];
          if (lastLine.length === 0) {
            lastLine.push({ text: lines[i], type: 'text' });
          } else {
            const lastFragment = lastLine[lastLine.length - 1];
            lastFragment.text += lines[i];
          }
          // Appliquer la coloration syntaxique
          applySyntaxHighlighting(lastLine);
        } else {
          // Nouvelles lignes
          const newLine = [{ text: lines[i], type: 'text' }];
          applySyntaxHighlighting(newLine);
          displayedLines = [...displayedLines, newLine];
        }
      }
      
      displayedLines = [...displayedLines];
      showNotification('Texte collé !');
    } catch (err) {
      console.error('Erreur lors du collage:', err);
    }
  }

  function selectAllCode() {
    // Sélectionner tout le texte affiché
    const codeText = displayedLines.map(line => 
      line.map(frag => frag.text).join('')
    ).join('\n');
    
    // Créer un élément temporaire pour la sélection
    const textArea = document.createElement('textarea');
    textArea.value = codeText;
    document.body.appendChild(textArea);
    textArea.select();
    document.body.removeChild(textArea);
    
    console.log('Tout le code sélectionné');
    showNotification('Code sélectionné !');
  }

  function showNotification(message: string) {
    // Créer une notification temporaire
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 122, 204, 0.9);
      color: white;
      padding: 10px 15px;
      border-radius: 5px;
      z-index: 1000;
      font-size: 14px;
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 2000);
  }

  function applySyntaxHighlighting(line: Fragment[]) {
    if (line.length === 0) return;
    
    // Récupérer le texte complet de la ligne
    const fullText = line.map(frag => frag.text).join('');
    
    // Réinitialiser la ligne avec la coloration syntaxique
    line.length = 0;
    
    // Mots-clés JavaScript/TypeScript
    const keywords = ['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'return', 'import', 'export', 'from', 'class', 'interface', 'type', 'async', 'await', 'try', 'catch', 'finally', 'throw', 'new', 'this', 'super', 'extends', 'implements', 'public', 'private', 'protected', 'static', 'readonly', 'abstract', 'enum', 'namespace', 'module', 'declare', 'namespace', 'global', 'any', 'string', 'number', 'boolean', 'object', 'array', 'void', 'null', 'undefined', 'true', 'false'];
    
    // Fonctions communes
    const functions = ['console', 'log', 'error', 'warn', 'info', 'alert', 'prompt', 'confirm', 'parseInt', 'parseFloat', 'toString', 'toFixed', 'toUpperCase', 'toLowerCase', 'trim', 'split', 'join', 'push', 'pop', 'shift', 'unshift', 'slice', 'splice', 'indexOf', 'lastIndexOf', 'includes', 'startsWith', 'endsWith', 'replace', 'match', 'search', 'test', 'exec', 'map', 'filter', 'reduce', 'forEach', 'find', 'findIndex', 'some', 'every', 'sort', 'reverse', 'keys', 'values', 'entries', 'assign', 'create', 'defineProperty', 'getOwnPropertyNames', 'hasOwnProperty', 'isArray', 'isNaN', 'isFinite', 'isInteger', 'isSafeInteger', 'parseFloat', 'parseInt', 'encodeURI', 'decodeURI', 'encodeURIComponent', 'decodeURIComponent', 'escape', 'unescape', 'btoa', 'atob', 'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval', 'requestAnimationFrame', 'cancelAnimationFrame', 'fetch', 'XMLHttpRequest', 'Promise', 'resolve', 'reject', 'all', 'race', 'then', 'catch', 'finally', 'async', 'await', 'yield', 'generator', 'iterator', 'Symbol', 'Map', 'Set', 'WeakMap', 'WeakSet', 'Proxy', 'Reflect', 'Object', 'Array', 'String', 'Number', 'Boolean', 'Date', 'Math', 'JSON', 'RegExp', 'Error', 'TypeError', 'ReferenceError', 'SyntaxError', 'RangeError', 'EvalError', 'URIError', 'DOMException', 'Event', 'EventTarget', 'Node', 'Element', 'HTMLElement', 'Document', 'Window', 'Navigator', 'Location', 'History', 'Screen', 'Storage', 'localStorage', 'sessionStorage', 'indexedDB', 'WebSocket', 'Worker', 'SharedWorker', 'ServiceWorker', 'Blob', 'File', 'FileReader', 'FormData', 'URL', 'URLSearchParams', 'Headers', 'Request', 'Response', 'AbortController', 'AbortSignal', 'IntersectionObserver', 'MutationObserver', 'ResizeObserver', 'PerformanceObserver', 'IntersectionObserverEntry', 'MutationRecord', 'ResizeObserverEntry', 'PerformanceEntry', 'PerformanceMark', 'PerformanceMeasure', 'PerformanceNavigationTiming', 'PerformanceResourceTiming', 'PerformancePaintTiming', 'PerformanceLongTaskTiming', 'PerformanceEventTiming', 'PerformanceLayoutShift', 'PerformanceFirstInput', 'PerformanceLargestContentfulPaint', 'PerformanceCumulativeLayoutShift', 'PerformanceFirstContentfulPaint', 'PerformanceNavigation', 'PerformanceTiming', 'PerformanceMemory', 'PerformanceNavigationTiming', 'PerformanceResourceTiming', 'PerformancePaintTiming', 'PerformanceLongTaskTiming', 'PerformanceEventTiming', 'PerformanceLayoutShift', 'PerformanceFirstInput', 'PerformanceLargestContentfulPaint', 'PerformanceCumulativeLayoutShift', 'PerformanceFirstContentfulPaint'];
    
    // Analyser le texte et appliquer la coloration
    let currentText = fullText;
    let position = 0;
    
    while (position < currentText.length) {
      let found = false;
      
      // Commentaires (// ou /* */)
      if (currentText[position] === '/' && currentText[position + 1] === '/') {
        const commentEnd = currentText.indexOf('\n', position);
        const commentText = commentEnd === -1 ? currentText.slice(position) : currentText.slice(position, commentEnd);
        line.push({ text: commentText, type: 'comment' });
        position += commentText.length;
        found = true;
      } else if (currentText[position] === '/' && currentText[position + 1] === '*') {
        const commentEnd = currentText.indexOf('*/', position);
        if (commentEnd !== -1) {
          const commentText = currentText.slice(position, commentEnd + 2);
          line.push({ text: commentText, type: 'comment' });
          position += commentText.length;
          found = true;
        }
      }
      
      // Strings ("" ou '' ou ``)
      if (!found && (currentText[position] === '"' || currentText[position] === "'" || currentText[position] === '`')) {
        const quote = currentText[position];
        let stringEnd = position + 1;
        let escaped = false;
        
        while (stringEnd < currentText.length) {
          if (currentText[stringEnd] === '\\' && !escaped) {
            escaped = true;
          } else if (currentText[stringEnd] === quote && !escaped) {
            stringEnd++;
            break;
          } else {
            escaped = false;
          }
          stringEnd++;
        }
        
        const stringText = currentText.slice(position, stringEnd);
        line.push({ text: stringText, type: 'string' });
        position = stringEnd;
        found = true;
      }
      
      // Nombres
      if (!found && /[0-9]/.test(currentText[position])) {
        let numberEnd = position;
        while (numberEnd < currentText.length && /[0-9.]/.test(currentText[numberEnd])) {
          numberEnd++;
        }
        const numberText = currentText.slice(position, numberEnd);
        line.push({ text: numberText, type: 'number' });
        position = numberEnd;
        found = true;
      }
      
      // Mots-clés et identifiants
      if (!found && /[a-zA-Z_$]/.test(currentText[position])) {
        let wordEnd = position;
        while (wordEnd < currentText.length && /[a-zA-Z0-9_$]/.test(currentText[wordEnd])) {
          wordEnd++;
        }
        const word = currentText.slice(position, wordEnd);
        
        if (keywords.includes(word)) {
          line.push({ text: word, type: 'keyword' });
        } else if (functions.includes(word)) {
          line.push({ text: word, type: 'function' });
        } else {
          line.push({ text: word, type: 'variable' });
        }
        position = wordEnd;
        found = true;
      }
      
      // Opérateurs et ponctuation
      if (!found) {
        const char = currentText[position];
        if (['+', '-', '*', '/', '=', '!', '<', '>', '&', '|', '^', '~', '?', ':'].includes(char)) {
          line.push({ text: char, type: 'operator' });
          position++;
          found = true;
        } else if (['(', ')'].includes(char)) {
          line.push({ text: char, type: 'paren' });
          position++;
          found = true;
        } else if (['[', ']'].includes(char)) {
          line.push({ text: char, type: 'brace' });
          position++;
          found = true;
        } else if (['{', '}'].includes(char)) {
          line.push({ text: char, type: 'brace' });
          position++;
          found = true;
        } else if ([';', ',', '.'].includes(char)) {
          line.push({ text: char, type: 'paren' });
          position++;
          found = true;
        }
      }
      
      // Caractère par défaut
      if (!found) {
        line.push({ text: currentText[position], type: 'text' });
        position++;
      }
    }
  }

  async function typeCodeLoop() {
    console.log('typeCodeLoop démarré');
    while (true) {
      // Attendre si l'utilisateur a pris le contrôle
      if (userControl) {
        console.log('Animation en pause - mode utilisateur actif');
        await new Promise(r => setTimeout(r, 100));
        continue;
      }
      
      console.log('Début d\'une nouvelle séquence d\'animation');
      
      const codeLines: CodeLine[] = getRandomExample();
      displayedLines = [];
      isTyping = true;
      currentLineIndex = 0;
      currentCharIndex = 0;
      
      for (let i = 0; i < codeLines.length; i++) {
        // Vérifier si l'utilisateur a pris le contrôle pendant la boucle
        if (userControl) {
          console.log('Animation interrompue par l\'utilisateur');
          break;
        }
        
        let line: Fragment[] = [];
        for (let frag of codeLines[i]) {
          // Vérifier à nouveau avant chaque fragment
          if (userControl) {
            console.log('Animation interrompue pendant la frappe');
            break;
          }
          
          // Vitesse équilibrée selon le type de contenu
          const baseDelay = frag.type === 'comment' ? 50 : 
                           frag.type === 'string' ? 40 : 
                           frag.type === 'keyword' ? 60 : 
                           frag.type === 'function' ? 70 : 35;
          
          for (let k = 1; k <= frag.text.length; k++) {
            // Vérifier avant chaque caractère
            if (userControl) {
              console.log('Animation interrompue pendant la frappe de caractères');
              break;
            }
            
            line = [...line, { text: frag.text.slice(0, k), type: frag.type }];
            displayedLines = [
              ...displayedLines.slice(0, i),
              line,
            ];
            
            // Délai variable pour simuler la frappe humaine
            const randomDelay = baseDelay + Math.random() * 40;
            await new Promise(r => setTimeout(r, randomDelay));
            line = [...line.slice(0, -1)];
            
            // Pause de réflexion aléatoire (3% de chance)
            if (Math.random() < 0.03) {
              const thinkingPause = 200 + Math.random() * 400;
              await new Promise(r => setTimeout(r, thinkingPause));
            }
          }
          
          // Vérifier après la boucle de caractères
          if (userControl) break;
          
          // Pause de réflexion après certains éléments
          if (frag.type === 'keyword' || frag.type === 'function' || 
              frag.text.includes('{') || frag.text.includes('}') ||
              frag.text.includes('(') || frag.text.includes(')')) {
            const thinkingPause = 100 + Math.random() * 200;
            await new Promise(r => setTimeout(r, thinkingPause));
          }
          
          line = [...line, frag];
          displayedLines = [
            ...displayedLines.slice(0, i),
            line,
          ];
        }
        
        // Vérifier avant la pause entre les lignes
        if (userControl) break;
        
        // Pause variable entre les lignes avec temps de réflexion
        let linePause;
        if (line.length === 0) {
          // Lignes vides = pause de réflexion
          linePause = 400 + Math.random() * 300;
        } else if (line.some(frag => frag.type === 'keyword' && 
                   (frag.text.includes('function') || frag.text.includes('class') || 
                    frag.text.includes('interface') || frag.text.includes('async')))) {
          // Pause de réflexion après des mots-clés importants
          linePause = 300 + Math.random() * 400;
        } else if (line.some(frag => frag.text.includes('{') || frag.text.includes('}'))) {
          // Pause après les accolades
          linePause = 200 + Math.random() * 200;
        } else {
          // Pause normale
          linePause = 100 + Math.random() * 150;
        }
        
        await new Promise(r => setTimeout(r, linePause));
      }
      
      // Pause plus longue entre les séquences
      isTyping = false;
      
      // Vérifier si l'utilisateur a pris le contrôle pendant la pause
      if (userControl) {
        console.log('Animation en pause - utilisateur a pris le contrôle');
        continue;
      }
      
      await new Promise(r => setTimeout(r, 2000 + Math.random() * 1000));
    }
  }
</script>

<div class="hero" class:fade-in={isVisible}>
  <video
    class="hero-bg-video"
    src="/video/hero-bg.mp4"
    autoplay
    muted
    loop
    playsinline
    aria-hidden="true"
    class:hidden={!showVideo}
  ></video>
  <!-- Input caché pour le clavier mobile -->
  <input 
    bind:this={mobileInput}
    type="text" 
    style="position: absolute; left: -9999px; opacity: 0; pointer-events: none;"
    on:input={handleMobileInput}
    class:hidden={!userControl}
  />
  
  <div class="code-bg" aria-hidden="true" class:hidden={!showCode} class:vivid={webHover} class:user-control={userControl} on:click={handleCodeClick} on:keydown={handleKeydown} on:touchstart={handleCodeClick} tabindex="0" role="textbox" contenteditable="true" inputmode="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
    <div class="code-container">
      <!-- Message d'indication intégré dans l'animation -->
      {#if userControl}
        <div class="code-line typing">
          <span class="line-number">0</span>
          <span class="line-content">
            <span class="comment">// 🎮 Mode interactif - ESC: reprendre | Ctrl+C: copier | Ctrl+V: coller | Ctrl+A: sélectionner</span>
          </span>
        </div>
      {:else}
      <div class="code-line">
          <span class="line-number">0</span>
          <span class="line-content">
            <span class="comment">// 👆 Cliquez pour prendre le contrôle de l'édition</span>
          </span>
        </div>
      {/if}
      {#each displayedLines as line, index}
        <div class="code-line" class:typing={isTyping && index === displayedLines.length - 1} class:user-typing={userControl && index === displayedLines.length - 1}>
          <span class="line-number">{index + 1}</span>
          <span class="line-content">
        {#each line as frag}
          <span class={frag.type}>{frag.text}</span>
        {/each}
            {#if index === displayedLines.length - 1}
              <span class="cursor" class:user-cursor={userControl}>|</span>
            {/if}
          </span>
      </div>
    {/each}
  </div>
  </div>
</div>

<!-- Section À propos -->
<section id="about-section" class="about-section">
  <div class="container">
    <h2>À propos</h2>
  <div class="about-content">
    <div class="about-text">
      <p>
          Développeur web passionné, je crée des expériences numériques modernes et performantes. 
          Spécialisé dans les technologies frontend et backend, je transforme vos idées en solutions concrètes.
      </p>
      <p>
          Mon approche combine créativité et rigueur technique pour livrer des projets qui marquent 
          et qui fonctionnent parfaitement sur tous les appareils.
        </p>
      </div>
      <div class="about-skills">
        <h3>Technologies</h3>
        <div class="skills-grid">
          <span class="skill">JavaScript</span>
          <span class="skill">TypeScript</span>
          <span class="skill">Svelte</span>
          <span class="skill">React</span>
          <span class="skill">Node.js</span>
          <span class="skill">CSS3</span>
          <span class="skill">HTML5</span>
          <span class="skill">Git</span>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  :global(html) { scroll-behavior: smooth; }
  .hero {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 0;
    position: relative;
    overflow: hidden;
  }

  /* Assurer la hauteur sur mobile */
  @media (max-width: 768px) {
    .hero {
      min-height: 100vh !important;
      height: 100vh !important;
      position: relative !important;
      background: #000 !important;
    }
    
  }

  .hero-bg-video {
    position: absolute;
    top: 0;
    right: 0;
    width: 30%;
    height: 100%;
    object-fit: cover;
    z-index: 0;
    opacity: 0.25;
    pointer-events: none;
    transition: opacity 0.5s cubic-bezier(.4,0,.2,1), filter 0.3s;
  }
  @media (max-width: 600px) {
    .hero-bg-video {
      display: none !important;
    }
    /* Animation de code maintenant visible sur mobile */
    .hero {
      width: 100% !important;
      overflow-x: hidden !important;
    }
    :global(body) {
      width: 100% !important;
      overflow-x: hidden !important;
      margin: 0 !important;
    }
  }
  .code-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    pointer-events: auto;
    opacity: 0.9;
    font-family: 'Fira Code', 'Fira Mono', 'Consolas', monospace;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    padding: 2rem;
    user-select: none;
    text-align: left;
    background: #1e1e1e;
    overflow: auto;
    cursor: pointer;
    box-sizing: border-box;
    min-height: 100vh;
  }

  /* Styles optimisés pour mobile */
  @media (max-width: 768px) {
    .code-bg {
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      width: 100% !important;
      height: 100% !important;
      z-index: 1 !important;
      display: flex !important;
      background: #1e1e1e !important;
      opacity: 0.95 !important;
      visibility: visible !important;
      pointer-events: auto !important;
      min-height: 100vh !important;
      padding: 1rem !important;
      box-sizing: border-box !important;
    }
    
    .code-container {
      position: relative !important;
      z-index: 2 !important;
      display: flex !important;
      flex-direction: column !important;
      width: 100% !important;
      max-width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      background: transparent !important;
    }
    
    .code-line {
      display: flex !important;
      align-items: flex-start !important;
      font-size: 0.9rem !important;
      white-space: pre-wrap !important;
      margin: 0.2rem 0 !important;
      line-height: 1.4 !important;
      min-height: 1.4em !important;
      word-wrap: break-word !important;
      overflow-wrap: break-word !important;
      background: transparent !important;
      padding: 0.1rem 0 !important;
    }
    
    .line-number {
      display: inline-block !important;
      width: 2rem !important;
      text-align: right !important;
      padding-right: 0.5rem !important;
      color: #666 !important;
      font-size: 0.9rem !important;
      user-select: none !important;
      flex-shrink: 0 !important;
    }
    
    .line-content {
      flex: 1 !important;
      display: inline-block !important;
    }
    
    .cursor {
      display: inline-block !important;
      background-color: #ffffff !important;
      width: 2px !important;
      height: 1.2em !important;
      margin-left: 2px !important;
      animation: blink 1s infinite !important;
      vertical-align: text-bottom !important;
    }
    
    .code-line.typing {
      background-color: rgba(255, 255, 255, 0.05) !important;
      border-left: 3px solid #007ACC !important;
      padding-left: 0.5rem !important;
      margin-left: -0.5rem !important;
      transition: all 0.3s ease !important;
    }
    
    .code-line.typing .line-number {
      color: #007ACC !important;
      font-weight: bold !important;
    }
    
    
    /* Coloration syntaxique pour mobile */
    .keyword { color: #569CD6 !important; font-weight: 500 !important; }
    .function { color: #DCDCAA !important; }
    .paren { color: #D4D4D4 !important; }
    .brace { color: #D4D4D4 !important; }
    .operator { color: #D4D4D4 !important; }
    .object { color: #4EC9B0 !important; }
    .method { color: #D7BA7D !important; }
    .text { color: #D4D4D4 !important; }
    .string { color: #CE9178 !important; }
    .number { color: #B5CEA8 !important; }
    .variable { color: #9CDCFE !important; }
    .property { color: #4EC9B0 !important; }
    .type { color: #4EC9B0 !important; font-style: italic !important; }
    .comment { color: #6A9955 !important; font-style: italic !important; }
  }

  /* Optimisations pour très petits écrans */
  @media (max-width: 480px) {
    .code-bg {
      padding: 0.8rem !important;
    }
    
    .code-line {
      font-size: 0.8rem !important;
      line-height: 1.3 !important;
      margin: 0.15rem 0 !important;
    }
    
    .line-number {
      width: 1.8rem !important;
      font-size: 0.75rem !important;
      padding-right: 0.3rem !important;
    }
    
  }
  .code-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem 0;
  }

  .code-line {
    display: flex;
    align-items: flex-start;
    font-size: 1rem;
    white-space: pre;
    margin: 0;
    line-height: 1.5;
    min-height: 1.5em;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }

  /* Responsive design parfait pour tous les écrans */
  
  /* Ultra large screens (4K+) */
  @media (min-width: 1920px) {
    .code-bg {
      padding: 2rem;
    }
    .code-line {
      font-size: 1.1rem;
    }
    .line-number {
      width: 3rem;
      font-size: 0.95rem;
    }
    
    /* Message d'indication responsive pour très grands écrans */
    .code-line:first-child .comment {
      font-size: 0.9rem;
      line-height: 1.4;
    }
  }

  /* Desktop large (1400px - 1919px) */
  @media (min-width: 1400px) and (max-width: 1919px) {
    .code-bg {
      padding: 2rem;
    }
    .code-line {
      font-size: 1rem;
    }
    .line-number {
      width: 3rem;
      font-size: 0.9rem;
    }
    
    /* Message d'indication responsive pour grands écrans */
    .code-line:first-child .comment {
      font-size: 0.85rem;
      line-height: 1.3;
    }
    .about-section h2 {
      font-size: 2.8rem;
    }
    .about-text p {
      font-size: 1.2rem;
    }
  }

  /* Desktop (1200px - 1399px) */
  @media (min-width: 1200px) and (max-width: 1399px) {
    .code-bg {
      padding: 2rem;
    }
    .code-line {
      font-size: 1rem;
    }
    .line-number {
      width: 2.5rem;
      font-size: 0.9rem;
    }
    
    /* Message d'indication responsive pour écrans moyens */
    .code-line:first-child .comment {
      font-size: 0.8rem;
      line-height: 1.3;
    }
    .about-section h2 {
      font-size: 2.5rem;
    }
    .about-text p {
      font-size: 1.1rem;
    }
  }

  /* Laptop (992px - 1199px) */
  @media (min-width: 992px) and (max-width: 1199px) {
    .code-bg {
      padding: 1.5rem;
    }
    .code-line {
      font-size: 0.95rem;
    }
    .line-number {
      width: 2.5rem;
      font-size: 0.85rem;
    }
    
    /* Message d'indication responsive pour tablettes */
    .code-line:first-child .comment {
      font-size: 0.75rem;
      line-height: 1.2;
    }
    .about-section h2 {
      font-size: 2.2rem;
    }
    .about-text p {
      font-size: 1.05rem;
    }
  }

  /* Tablet (768px - 991px) */
  /* Tablettes (768px - 991px) */
  @media (min-width: 768px) and (max-width: 991px) {
    .code-bg {
      padding: 1.5rem;
    }
    .code-line {
      font-size: 0.9rem;
    }
    .line-number {
      width: 2.5rem;
      font-size: 0.8rem;
    }
    
    /* Message d'indication responsive pour tablettes */
    .code-line:first-child .comment {
      font-size: 0.7rem;
      line-height: 1.2;
    }
  }

  /* Mobile large (576px - 767px) */
  @media (min-width: 576px) and (max-width: 767px) {
    .code-bg {
      padding: 1.2rem;
    }
    .code-line {
      font-size: 0.85rem;
      line-height: 1.4;
    }
    
    /* Message d'indication responsive pour mobiles larges */
    .code-line:first-child .comment {
      font-size: 0.65rem;
      line-height: 1.1;
    }
    .line-number {
      width: 2.2rem;
      font-size: 0.95rem;
    }
    .about-section {
      padding: 2.5rem 0;
    }
    .about-section h2 {
      font-size: 1.8rem;
    }
    .about-text p {
      font-size: 0.95rem;
    }
  }

  /* Mobile (480px - 575px) */
  @media (min-width: 480px) and (max-width: 575px) {
    .code-bg {
      padding: 1rem;
    }
    .code-line {
      font-size: 0.8rem;
      line-height: 1.3;
    }
    
    /* Message d'indication responsive pour petits mobiles */
    .code-line:first-child .comment {
      font-size: 0.6rem;
      line-height: 1.1;
    }
    .line-number {
      width: 2rem;
      font-size: 0.9rem;
    }
    .about-section {
      padding: 2rem 0;
    }
    .about-section h2 {
      font-size: 1.6rem;
    }
    .about-text p {
      font-size: 0.9rem;
    }
  }

  /* Mobile petit (400px - 479px) */
  @media (min-width: 400px) and (max-width: 479px) {
    .code-bg {
      padding: 0.8rem;
    }
    .code-line {
      font-size: 0.95rem;
      line-height: 1.4;
    }
    .line-number {
      width: 1.8rem;
      font-size: 0.8rem;
    }
    .about-section {
      padding: 1.5rem 0;
    }
    .about-section h2 {
      font-size: 1.4rem;
    }
    .about-text p {
      font-size: 0.85rem;
    }
  }

  /* Mobile très petit (360px - 399px) */
  @media (min-width: 360px) and (max-width: 399px) {
    .code-bg {
      padding: 0.6rem;
    }
    .code-line {
      font-size: 0.9rem;
      line-height: 1.3;
    }
    .line-number {
      width: 1.6rem;
      font-size: 0.75rem;
    }
    .about-section {
      padding: 1.2rem 0;
    }
    .about-section h2 {
      font-size: 1.2rem;
    }
    .about-text p {
      font-size: 0.8rem;
    }
  }

  /* Mobile minimal (< 360px) */
  @media (max-width: 359px) {
    .code-bg {
      padding: 0.5rem;
    }
    .code-line {
      font-size: 0.85rem;
      line-height: 1.2;
    }
    .line-number {
      width: 1.4rem;
      font-size: 0.7rem;
    }
    .shortcuts {
      flex-direction: column;
      gap: 0.2rem;
    }
    .about-section {
      padding: 1rem 0;
    }
    .about-section h2 {
      font-size: 1rem;
    }
    .about-text p {
      font-size: 0.75rem;
    }
  }

  .line-number {
    display: inline-block;
    width: 3rem;
    text-align: right;
    padding-right: 1rem;
    color: #666;
    font-size: 1.2rem;
    user-select: none;
    flex-shrink: 0;
  }

  .line-content {
    flex: 1;
    display: inline-block;
  }

  .cursor {
    display: inline-block;
    background-color: #ffffff;
    width: 2px;
    height: 1.2em;
    margin-left: 2px;
    animation: blink 1s infinite;
    vertical-align: text-bottom;
  }

  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }

  .code-line.typing {
    background-color: rgba(255, 255, 255, 0.05);
    border-left: 3px solid #007ACC;
    padding-left: 0.5rem;
    margin-left: -0.5rem;
    transition: all 0.3s ease;
  }

  .code-line.typing .line-number {
    color: #007ACC;
    font-weight: bold;
  }

  .code-bg.user-control {
    cursor: text;
    outline: 2px solid #007ACC;
    outline-offset: -2px;
  }

  .code-bg:hover:not(.user-control) {
    cursor: pointer;
    background: rgba(30, 30, 30, 0.95);
  }




  .code-line.user-typing {
    background-color: rgba(0, 122, 204, 0.1);
    border-left: 3px solid #007ACC;
    padding-left: 0.5rem;
    margin-left: -0.5rem;
  }

  .cursor.user-cursor {
    background-color: #007ACC;
    animation: blink 0.8s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }

  @keyframes fadeInOut {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }
  .keyword { color: #569CD6; font-weight: 500; }
  .function { color: #DCDCAA; }
  .paren { color: #D4D4D4; }
  .brace { color: #D4D4D4; }
  .operator { color: #D4D4D4; }
  .object { color: #4EC9B0; }
  .method { color: #D7BA7D; }
  .text { color: #D4D4D4; }
  .string { color: #CE9178; }
  .number { color: #B5CEA8; }
  .variable { color: #9CDCFE; }
  .property { color: #4EC9B0; }
  .type { color: #4EC9B0; font-style: italic; }
  .comment { color: #6A9955; font-style: italic; }

  .fade-in { animation: fadeIn 1s ease-in; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(20px);} to { opacity: 1; transform: translateY(0);} }

  /* Section À propos */
  .about-section {
    padding: 4rem 0;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
    position: relative;
    z-index: 10;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
  }

  .about-section h2 {
    font-size: 2.5rem;
    color: #2c3e50;
    margin-bottom: 2rem;
    text-align: center;
    font-weight: 700;
  }

  .about-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
    align-items: start;
  }

  .about-text p {
    font-size: 1.1rem;
    line-height: 1.8;
    color: #555;
    margin-bottom: 1.5rem;
  }

  .about-skills h3 {
    font-size: 1.5rem;
    color: #2c3e50;
    margin-bottom: 1.5rem;
    font-weight: 600;
  }

  .skills-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1rem;
  }

  .skill {
    background: #007ACC;
    color: white;
    padding: 0.8rem 1.2rem;
    border-radius: 25px;
    text-align: center;
    font-weight: 500;
    font-size: 0.9rem;
    transition: all 0.3s ease;
  }

  .skill:hover {
    background: #005a9e;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 122, 204, 0.3);
  }

  /* Responsive parfait pour la section À propos */
  
  /* Ultra large screens (4K+) */
  @media (min-width: 1920px) {
    .about-section {
      padding: 6rem 0;
    }
    .about-content {
      gap: 4rem;
    }
    .skills-grid {
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1.5rem;
    }
    .skill {
      padding: 1rem 1.5rem;
      font-size: 1.1rem;
    }
  }

  /* Desktop large (1400px - 1919px) */
  @media (min-width: 1400px) and (max-width: 1919px) {
    .about-section {
      padding: 5rem 0;
    }
    .about-content {
      gap: 3.5rem;
    }
    .skills-grid {
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 1.3rem;
    }
    .skill {
      padding: 0.9rem 1.3rem;
      font-size: 1rem;
    }
  }

  /* Desktop (1200px - 1399px) */
  @media (min-width: 1200px) and (max-width: 1399px) {
    .about-section {
      padding: 4rem 0;
    }
    .about-content {
      gap: 3rem;
    }
    .skills-grid {
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 1.2rem;
    }
    .skill {
      padding: 0.8rem 1.2rem;
      font-size: 0.95rem;
    }
  }

  /* Laptop (992px - 1199px) */
  @media (min-width: 992px) and (max-width: 1199px) {
    .about-section {
      padding: 3.5rem 0;
    }
    .about-content {
      gap: 2.5rem;
    }
    .skills-grid {
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 1rem;
    }
    .skill {
      padding: 0.7rem 1.1rem;
      font-size: 0.9rem;
    }
  }

  /* Tablet (768px - 991px) */
  @media (min-width: 768px) and (max-width: 991px) {
    .about-section {
      padding: 3rem 0;
    }
    .about-content {
      grid-template-columns: 1fr;
      gap: 2rem;
    }
    .skills-grid {
      grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
      gap: 0.9rem;
    }
    .skill {
      padding: 0.6rem 1rem;
      font-size: 0.85rem;
    }
  }

  /* Mobile large (576px - 767px) */
  @media (min-width: 576px) and (max-width: 767px) {
    .about-section {
      padding: 2.5rem 0;
    position: relative;
      z-index: 10;
    }
    .container {
      padding: 0 1.5rem;
    }
    .about-content {
      grid-template-columns: 1fr;
    gap: 2rem;
  }
    .skills-grid {
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      gap: 0.8rem;
    }
    .skill {
      padding: 0.6rem 1rem;
      font-size: 0.8rem;
    }
  }

  /* Mobile (480px - 575px) */
  @media (min-width: 480px) and (max-width: 575px) {
    .about-section {
      padding: 2rem 0;
    position: relative;
      z-index: 10;
    }
    .container {
      padding: 0 1rem;
    }
    .about-content {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
    .skills-grid {
      grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
      gap: 0.7rem;
    }
    .skill {
      padding: 0.5rem 0.8rem;
      font-size: 0.75rem;
    }
  }

  /* Mobile petit (400px - 479px) */
  @media (min-width: 400px) and (max-width: 479px) {
    .about-section {
      padding: 1.5rem 0;
    position: relative;
      z-index: 10;
    }
    .container {
      padding: 0 0.8rem;
    }
    .about-content {
      grid-template-columns: 1fr;
      gap: 1.2rem;
    }
    .skills-grid {
      grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
      gap: 0.6rem;
    }
    .skill {
      padding: 0.4rem 0.7rem;
      font-size: 0.7rem;
    }
  }

  /* Mobile très petit (360px - 399px) */
  @media (min-width: 360px) and (max-width: 399px) {
    .about-section {
      padding: 1.2rem 0;
      position: relative;
      z-index: 10;
    }
    .container {
      padding: 0 0.6rem;
    }
    .about-content {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
    .skills-grid {
      grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
      gap: 0.5rem;
    }
    .skill {
      padding: 0.3rem 0.6rem;
      font-size: 0.65rem;
    }
  }

  /* Mobile minimal (< 360px) */
  @media (max-width: 359px) {
    .about-section {
      padding: 1rem 0;
      position: relative;
      z-index: 10;
    }
    .container {
      padding: 0 0.5rem;
    }
    .about-content {
      grid-template-columns: 1fr;
      gap: 0.8rem;
    }
    .skills-grid {
      grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
      gap: 0.4rem;
    }
    .skill {
      padding: 0.25rem 0.5rem;
      font-size: 0.6rem;
    }
  }

  .hero-bg-video,
  .code-bg {
    transition: opacity 0.5s cubic-bezier(.4,0,.2,1);
  }

  .hidden {
    opacity: 0 !important;
    pointer-events: none;
  }

  .code-bg.vivid .keyword { color: #00bfff; }
  .code-bg.vivid .function { color: #ffe066; }
  .code-bg.vivid .paren, .code-bg.vivid .brace, .code-bg.vivid .operator { color: #fff; }
  .code-bg.vivid .object { color: #00ffb3; }
  .code-bg.vivid .method { color: #ffd700; }
  .code-bg.vivid .string { color: #ff5e5e; }
  .code-bg.vivid .number { color: #7fff00; }
  .code-bg.vivid .variable { color: #00eaff; }
  .code-bg.vivid .property { color: #00ffb3; }
  .code-bg.vivid .type { color: #7fff00; font-style: italic; }
  .code-bg.vivid .comment { color: #00ff00; font-style: italic; }

  .code-bg.vivid.vivid {
    filter: brightness(2) saturate(1.5) contrast(1.2);
    opacity: 0.9;
    transition: filter 0.3s, opacity 0.3s;
  }

  .hero-bg-video.video-vivid {
    filter: brightness(1.6) saturate(1.5) contrast(1.2);
    opacity: 0.4;
  }

</style>
