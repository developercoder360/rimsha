/* ================================================================
   MAGIC ENGINE (magic.js)
   Environments, Events, Noor Guide, Voice, Collectibles
================================================================ */

const magic = {
  environments: ['theme-nightsky', 'theme-morning', 'theme-sunset', 'theme-galaxy', 'theme-aurora', 'theme-dream'],
  currentEnvIndex: 0,
  voiceEnabled: false,
  synth: window.speechSynthesis,

  init() {
    this.startRandomEvents();
    this.startWeatherSystem();
    this.setupNoorGuide();
    this.setupVoiceToggle();
    this.setupFloatingBottle();
    setInterval(() => this.cycleEnvironment(), 60000); // Change env every 60s
  },

  cycleEnvironment() {
    document.body.classList.remove(this.environments[this.currentEnvIndex]);
    this.currentEnvIndex = (this.currentEnvIndex + 1) % this.environments.length;
    document.body.classList.add(this.environments[this.currentEnvIndex]);
    this.speak("Mausam badal raha hai!");
  },

  /* --- RANDOM EVENTS ENGINE --- */
  startRandomEvents() {
    setInterval(() => {
      if(document.hidden) return;
      const r = Math.random();
      if(r < 0.3) this.spawnShootingStar();
      else if(r < 0.6) this.spawnCollectible();
      else if(r < 0.8) this.triggerBottle();
      else this.noorSpeak(this.getRandomHint());
    }, 20000); // Every 20s something happens
  },

  spawnShootingStar() {
    const star = document.createElement('div');
    star.className = 'shooting-star';
    star.style.top = `${randInt(0, 30)}%`;
    star.style.right = `-100px`;
    $('#magic-events-layer').appendChild(star);
    setTimeout(() => star.remove(), 1200);
  },

  spawnCollectible() {
    const items = ['💎', '🌸', '✨', '🎁'];
    const item = items[randInt(0, items.length)];
    const c = document.createElement('div');
    c.className = 'collectible';
    c.textContent = item;
    c.style.left = `${randInt(10, 90)}%`;
    c.style.top = `${randInt(20, 80)}%`;
    
    c.addEventListener('click', () => {
      c.classList.add('collected');
      addPoints('xp', 5);
      this.noorSpeak("Wah! Tumhe magic item mil gaya!");
      setTimeout(() => c.remove(), 500);
    });
    
    $('#magic-events-layer').appendChild(c);
    setTimeout(() => { if(!c.classList.contains('collected')) c.remove(); }, 10000);
  },

  triggerBottle() {
    const b = $('#floating-bottle');
    if(!b.classList.contains('hidden')) return;
    b.classList.remove('hidden');
    
    b.onclick = () => {
      b.classList.add('hidden');
      addPoints('xp', 10);
      alert("Message in a Bottle: 'Tum jaisi dost kismat walon ko milti hai ❤️'");
      this.noorSpeak("Kitna pyara message tha!");
      b.onclick = null;
    };
    setTimeout(() => { b.classList.add('hidden'); b.onclick=null; }, 15000);
  },

  /* --- WEATHER SYSTEM --- */
  startWeatherSystem() {
    const layer = $('#weather-layer');
    // Fireflies
    for(let i=0; i<15; i++) {
      const f = document.createElement('div');
      f.className = 'firefly';
      f.style.left = `${randInt(0,100)}%`;
      f.style.top = `${randInt(0,100)}%`;
      f.style.animationDelay = `${rand(0,5)}s`;
      layer.appendChild(f);
    }
  },

  /* --- NOOR: THE GUIDE --- */
  setupNoorGuide() {
    const guide = $('#noor-guide');
    setTimeout(() => guide.classList.remove('noor-hidden'), 2000);
    
    guide.addEventListener('click', () => {
      burstConfetti({particleCount: 20, origin: {x: 0.9, y: 0.9}});
      this.noorSpeak(this.getRandomHint());
    });
  },

  noorSpeak(msg) {
    const bubble = $('#noor-bubble');
    bubble.textContent = msg;
    bubble.classList.remove('hidden');
    this.speak(msg);
    
    // Clear old timeout
    if(this.noorTimeout) clearTimeout(this.noorTimeout);
    this.noorTimeout = setTimeout(() => bubble.classList.add('hidden'), 4000);
  },

  getRandomHint() {
    const hints = [
      "Dekhte hain agay kya hota hai! ✨",
      "Tum bohot acha khel rahi ho!",
      "Screen pe click karte rehna!",
      "Kabhi kabhi asman mein shooting star ata hai.",
      "Happy Birthday Rimsha! 🎂"
    ];
    return hints[randInt(0, hints.length)];
  },

  /* --- VOICE API --- */
  setupVoiceToggle() {
    const btn = $('#voice-toggle-btn');
    btn.addEventListener('click', () => {
      this.voiceEnabled = !this.voiceEnabled;
      btn.textContent = this.voiceEnabled ? '🔊' : '🔇';
      if(this.voiceEnabled) this.speak("Awaaz on ho gayi hai!");
      else if(this.synth) this.synth.cancel();
    });
  },

  speak(text) {
    if(!this.voiceEnabled || !this.synth) return;
    this.synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN'; // Closest to Roman Urdu pronunciation
    utterance.rate = 0.9;
    utterance.pitch = 1.2;
    this.synth.speak(utterance);
  }
};

document.addEventListener('DOMContentLoaded', () => magic.init());

// Hook for popping balloons in landing section
window.popBalloon = function(el) {
  burstConfetti({particleCount: 10, origin: { x: el.getBoundingClientRect().left/innerWidth, y: el.getBoundingClientRect().top/innerHeight }});
  el.style.display = 'none';
  if(typeof addPoints === 'function') addPoints('xp', 2);
};
