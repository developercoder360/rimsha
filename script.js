/* ================================================================
   HAPPY BIRTHDAY RIMSHA — script.js
   Roman Urdu + Adventure Journey Edition
================================================================ */

'use strict';

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const rand = (min, max) => Math.random() * (max - min) + min;
const randInt = (min, max) => Math.floor(rand(min, max));

/* ================================================================
   1. STATE MANAGEMENT (LOCAL STORAGE)
================================================================ */
const TOTAL_LEVELS = 16;
const STORAGE_KEY = 'rimsha_bday_adventure_state';

let gameState = {
  currentLevel: 1,
  stars: 0,
  hearts: 0,
  points: 0,
  xp: 0,
  achievements: []
};

function loadProgress() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      gameState = { ...gameState, ...JSON.parse(saved) };
    } catch (e) { }
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  updateHUD();
}

function resetProgress() {
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
}

/* ================================================================
   2. CUSTOM CURSOR LOGIC
================================================================ */
const cursorEl = $('#custom-cursor');
const cursorDot = $('.cursor-dot', cursorEl);
const cursorRing = $('.cursor-ring', cursorEl);
const cursorIcon = $('.cursor-icon', cursorEl);
const cursorTrailContainer = $('.cursor-trail-container', cursorEl);

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let ringX = mouseX;
let ringY = mouseY;
let isTouch = false;

window.addEventListener('touchstart', () => isTouch = true, { once: true });

document.addEventListener('mousemove', (e) => {
  if (isTouch) return;
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursorDot.style.transform = `translate(calc(${mouseX}px - 50%), calc(${mouseY}px - 50%))`;
});

// Smooth ring follow using requestAnimationFrame
function animateCursor() {
  if (!isTouch) {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    cursorRing.style.transform = `translate(calc(${ringX}px - 50%), calc(${ringY}px - 50%))`;
    cursorIcon.style.transform = `translate(calc(${ringX}px - 50%), calc(${ringY}px - 50%))`;
    cursorTrailContainer.style.transform = `translate(${ringX}px, ${ringY}px)`;
  }
  requestAnimationFrame(animateCursor);
}
requestAnimationFrame(animateCursor);

// Hover states based on data-cursor attribute
document.addEventListener('mouseover', (e) => {
  if (isTouch) return;
  const target = e.target.closest('[data-cursor]');
  if (target) {
    const type = target.getAttribute('data-cursor');
    if (type === 'hover') cursorEl.classList.add('cursor-hover');
    else if (type === 'glow') cursorEl.classList.add('cursor-glow');
    else {
      cursorEl.classList.add('cursor-icon-active');
      let icon = '';
      if (type === 'heart') icon = '❤️';
      if (type === 'gift') icon = '🎁';
      if (type === 'cake') icon = '🔥';
      if (type === 'star') icon = '⭐';
      if (type === 'balloon') icon = '🎈';
      cursorIcon.textContent = icon;
    }
  }
});

document.addEventListener('mouseout', (e) => {
  const target = e.target.closest('[data-cursor]');
  if (target) {
    cursorEl.className = 'custom-cursor'; // Reset classes
    cursorIcon.textContent = '';
  }
});

// Click Ripple & Sparks
document.addEventListener('mousedown', (e) => {
  if (isTouch) return;
  cursorEl.classList.add('cursor-click');
  setTimeout(() => cursorEl.classList.remove('cursor-click'), 400);

  // Create sparks
  for (let i = 0; i < 3; i++) {
    createTrailParticle(e.clientX, e.clientY, true);
  }
});

// Cursor Trail
let trailTimer;
document.addEventListener('mousemove', (e) => {
  if (isTouch) return;
  if (Math.random() > 0.8) { // Don't create on every tick
    createTrailParticle(e.clientX, e.clientY, false);
  }
});

function createTrailParticle(x, y, isSpark) {
  const p = document.createElement('div');
  p.className = 'cursor-trail';
  const size = isSpark ? rand(4, 8) : rand(2, 5);
  p.style.width = `${size}px`;
  p.style.height = `${size}px`;
  p.style.background = isSpark ? 'var(--gold)' : 'var(--pink)';
  p.style.boxShadow = `0 0 5px ${p.style.background}`;

  // Convert absolute to relative to trail container (which is following ringX/Y)
  // Actually, easiest to just append to body with absolute coords
  p.style.left = `${x + rand(-10, 10)}px`;
  p.style.top = `${y + rand(-10, 10)}px`;

  document.body.appendChild(p);
  setTimeout(() => p.remove(), 600);
}


/* ================================================================
   3. UTILITIES & ANIMATIONS
================================================================ */
function burstConfetti(options = {}) {
  if (typeof confetti !== 'undefined') {
    confetti({
      particleCount: 100, spread: 70, startVelocity: 30,
      origin: { x: 0.5, y: 0.6 },
      colors: ['#ff6eb4', '#c77dff', '#6eb5ff', '#ffd700', '#ffffff'],
      ...options
    });
  }
}

function showToast(title) {
  const toast = $('#achievement-toast');
  $('#toast-title').textContent = title;
  toast.classList.remove('hidden');
  toast.classList.add('show');
  burstConfetti({ particleCount: 50, origin: { x: 0.8, y: 0.8 } });
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.classList.add('hidden'), 500);
  }, 4000);
}

function unlockAchievement(id, title) {
  if (!gameState.achievements.includes(id)) {
    gameState.achievements.push(id);
    showToast(title);
    addPoints('stars', 1);
    saveProgress();
  }
}

function addPoints(type, amount) {
  gameState[type] += amount;
  updateHUD();
}

function updateHUD() {
  $('#current-level-display').textContent = `Level ${gameState.currentLevel}`;
  $('#stat-stars').textContent = gameState.stars;
  $('#stat-hearts').textContent = gameState.hearts;
  $('#stat-xp').textContent = gameState.xp;
  
  const pct = ((gameState.currentLevel - 1) / TOTAL_LEVELS) * 100;
  $('#progress-bar-fill').style.width = `${pct}%`;
}


/* ================================================================
   4. LEVEL MANAGER
================================================================ */
function startAdventure() {
  $('#landing').classList.add('hidden');
  $('#hud').classList.remove('hidden');
  $('#adventure-journey').classList.remove('hidden');

  // Hide all levels, show current
  $$('.level-container').forEach(el => el.classList.add('hidden'));

  if (gameState.currentLevel >= 16) {
    revealFinale();
  } else {
    initLevel(gameState.currentLevel);
  }
}

function completeLevel() {
  burstConfetti();
  gameState.currentLevel++;
  saveProgress();
  
  setTimeout(() => {
    $$('.level-container').forEach(el => el.classList.add('hidden'));
    if (gameState.currentLevel >= 16) {
      revealFinale();
    } else {
      initLevel(gameState.currentLevel);
    }
  }, 2000);
}

function initLevel(level) {
  const lvEl = $(`#level-${level}`);
  if (lvEl) {
    lvEl.classList.remove('hidden');
    lvEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Level specific initializations
    if (level === 2) initLevel2();
    if (level === 3) initLevel3();
    if (level === 4) initLevel4();
    if (level === 5) initLevel5();
    if (level === 6) initLevel6();
    if (level === 7) initLevel7();
    if(level === 8) initLevel8();
    if(level === 9) initLevel9();
    
    if(window.initExtraLevels) window.initExtraLevels(level);
  }
}


/* ================================================================
   5. LEVEL MECHANICS
================================================================ */

// LEVEL 1: Welcome
$('#l1-btn')?.addEventListener('click', (e) => {
  e.target.disabled = true;
  e.target.textContent = 'Awesome! ✨';
  addPoints('hearts', 1);
  completeLevel();
});

// LEVEL 2: Memory Puzzle
let l2Flipped = [];
let l2Matches = 0;
function initLevel2() {
  const grid = $('#memory-grid');
  grid.innerHTML = '';
  const emojis = ['🎂', '🎁', '🎈', '💖'];
  const deck = [...emojis, ...emojis].sort(() => Math.random() - 0.5);

  deck.forEach((e, i) => {
    const card = document.createElement('div');
    card.className = 'mem-card';
    card.setAttribute('data-cursor', 'hover');
    card.innerHTML = `
      <div class="mem-card-inner">
        <div class="mem-card-front">❓</div>
        <div class="mem-card-back">${e}</div>
      </div>
    `;
    card.dataset.val = e;
    card.addEventListener('click', () => handleL2Click(card));
    grid.appendChild(card);
  });
}
function handleL2Click(card) {
  if (card.classList.contains('flipped') || card.classList.contains('matched') || l2Flipped.length >= 2) return;
  card.classList.add('flipped');
  l2Flipped.push(card);

  if (l2Flipped.length === 2) {
    if (l2Flipped[0].dataset.val === l2Flipped[1].dataset.val) {
      l2Flipped.forEach(c => c.classList.add('matched'));
      l2Flipped = [];
      l2Matches++;
      addPoints('points', 10);
      burstConfetti({ particleCount: 30 });
      if (l2Matches === 4) {
        unlockAchievement('mem_master', 'Memory Master');
        setTimeout(completeLevel, 1000);
      }
    } else {
      setTimeout(() => {
        l2Flipped.forEach(c => c.classList.remove('flipped'));
        l2Flipped = [];
      }, 1000);
    }
  }
}


// LEVEL 3: Catch the Hearts
let l3Score = 0;
let l3Int;
function initLevel3() {
  l3Score = 0;
  $('#catch-score-val').textContent = l3Score;
  const area = $('#catch-area');
  area.innerHTML = '';

  l3Int = setInterval(() => {
    if (l3Score >= 15) { clearInterval(l3Int); return; }
    const h = document.createElement('div');
    h.className = 'catch-item';
    h.textContent = '💖';
    h.setAttribute('data-cursor', 'heart');
    h.style.left = `${randInt(5, 85)}%`;
    h.style.top = `${randInt(10, 80)}%`;

    h.addEventListener('click', () => {
      if (h.classList.contains('caught')) return;
      h.classList.add('caught');
      l3Score++;
      $('#catch-score-val').textContent = l3Score;
      addPoints('hearts', 1);
      setTimeout(() => h.remove(), 300);

      if (l3Score >= 15) {
        clearInterval(l3Int);
        unlockAchievement('heart_hunter', 'Heart Hunter');
        completeLevel();
      }
    });

    area.appendChild(h);
    setTimeout(() => { if (!h.classList.contains('caught')) h.remove(); }, 1500);
  }, 600);
}


// LEVEL 4: Birthday Quiz
const quizData = [
  { q: "Hamari pehli mulaqat kahan hui thi?", opts: ["LinkedIn", "Facebook", "Instagram", "WhatsApp"], a: 0 },
  { q: "Ham zyada kis cheez par baat karte thay?", opts: ["Movies", "Random Talks & Ideas", "Food", "Games"], a: 1 }
];
let l4QIndex = 0;
function initLevel4() {
  l4QIndex = 0;
  renderQuiz();
}
function renderQuiz() {
  const c = $('#quiz-container');
  if (l4QIndex >= quizData.length) {
    c.innerHTML = '<h3>Zabardast! Saare jawab sahi! 🎉</h3>';
    addPoints('points', 50);
    setTimeout(completeLevel, 1500);
    return;
  }
  const q = quizData[l4QIndex];
  c.innerHTML = `
    <div class="quiz-question">${q.q}</div>
    <div class="quiz-options">
      ${q.opts.map((opt, i) => `<button class="quiz-opt" data-idx="${i}" data-cursor="hover">${opt}</button>`).join('')}
    </div>
  `;
  $$('.quiz-opt', c).forEach(b => {
    b.addEventListener('click', () => {
      if (parseInt(b.dataset.idx) === q.a) {
        b.classList.add('correct');
        addPoints('points', 10);
        burstConfetti({ particleCount: 20 });
        setTimeout(() => { l4QIndex++; renderQuiz(); }, 1000);
      } else {
        b.classList.add('wrong');
        setTimeout(() => b.classList.remove('wrong'), 500);
      }
    });
  });
}


// LEVEL 5: Hidden Gift
function initLevel5() {
  const msg = $('#l5-msg');
  msg.textContent = '';
  const boxes = $$('.mystery-box');
  boxes.forEach(b => {
    b.className = 'mystery-box';
    b.innerHTML = '📦';
    b.addEventListener('click', function handler() {
      if (this.dataset.correct === 'true') {
        this.classList.add('correct');
        this.innerHTML = '🎁';
        msg.textContent = 'Yay! Tum ne dhoond liya! 🎉';
        boxes.forEach(bx => bx.removeEventListener('click', handler));
        addPoints('points', 30);
        unlockAchievement('gift_finder', 'Gift Finder');
        setTimeout(completeLevel, 2000);
      } else {
        this.classList.add('wrong');
        this.innerHTML = '💨';
        msg.textContent = 'Oops! Khaali hai. Dobara try karo!';
      }
    });
  });
}


// LEVEL 6: Collect Candles
let l6Score = 0;
let l6Time = 15;
let l6Timer;
let l6Spawner;
function initLevel6() {
  l6Score = 0; l6Time = 15;
  $('#candle-score').textContent = l6Score;
  $('#candle-timer').textContent = l6Time;
  $('#candle-area').innerHTML = '';

  l6Timer = setInterval(() => {
    l6Time--;
    $('#candle-timer').textContent = l6Time;
    if (l6Time <= 0) {
      clearInterval(l6Timer);
      clearInterval(l6Spawner);
      if (l6Score < 5) {
        // Reset level
        setTimeout(initLevel6, 1000);
      }
    }
  }, 1000);

  l6Spawner = setInterval(() => {
    if (l6Time <= 0 || l6Score >= 5) return;
    const c = document.createElement('div');
    c.className = 'catch-item';
    c.textContent = '🕯️';
    c.setAttribute('data-cursor', 'cake');
    c.style.left = `${randInt(5, 90)}%`;
    c.style.top = `${randInt(10, 80)}%`;

    c.addEventListener('click', () => {
      c.remove();
      l6Score++;
      $('#candle-score').textContent = l6Score;
      addPoints('stars', 1);
      burstConfetti({ particleCount: 10 });
      if (l6Score >= 5) {
        clearInterval(l6Timer);
        clearInterval(l6Spawner);
        $('#candle-timer').textContent = 'Done!';
        setTimeout(completeLevel, 1000);
      }
    });
    $('#candle-area').appendChild(c);
    setTimeout(() => c.remove(), 1200);
  }, 800);
}


// LEVEL 7: Build the Cake
function initLevel7() {
  const parts = ['base', 'cream', 'chocolate', 'cherry'];
  let currentIdx = 0;
  const msg = $('#l7-msg');

  $$('.ing-btn').forEach(b => {
    b.classList.add('hidden');
    b.addEventListener('click', () => {
      const part = b.dataset.part;
      if (part === parts[currentIdx]) {
        b.classList.add('hidden');
        $(`.c-${part}`).classList.remove('hidden');
        addPoints('points', 10);
        currentIdx++;
        if (currentIdx < parts.length) {
          $(`.ing-btn[data-part="${parts[currentIdx]}"]`).classList.remove('hidden');
        } else {
          msg.textContent = 'Khoobsurat Cake Tayar Hai! 🎂';
          unlockAchievement('cake_designer', 'Cake Designer');
          burstConfetti({ particleCount: 150 });
          setTimeout(completeLevel, 2500);
        }
      }
    });
  });

  // Hide all parts on display
  $$('.c-part').forEach(p => p.classList.add('hidden'));
  msg.textContent = '';
  // Show first button
  $(`.ing-btn[data-part="base"]`).classList.remove('hidden');
}


// LEVEL 8: Unlock the Heart
function initLevel8() {
  const input = $('#heart-password');
  const btn = $('#unlock-heart-btn');
  const msg = $('#l8-msg');
  input.value = '';
  msg.textContent = '';

  btn.onclick = () => {
    if (input.value.toLowerCase().trim() === 'linkedin') {
      msg.textContent = 'Password Sahi Hai! Dil Khul Gaya 🔓💖';
      msg.style.color = 'var(--gold)';
      addPoints('hearts', 5);
      burstConfetti({ shapes: ['heart'] });
      setTimeout(completeLevel, 2000);
    } else {
      msg.textContent = 'Galat Password. Hint dekho!';
      msg.style.color = 'var(--pink)';
    }
  };
}


// LEVEL 9: Message Collection
let l9Collected = 0;
let l9Spawner;
function initLevel9() {
  const msgStr = "HAPPY BIRTHDAY RIMSHA".replace(/ /g, '');
  const slots = $('#message-slots');
  const area = $('#letter-area');
  slots.innerHTML = '';
  area.innerHTML = '';
  l9Collected = 0;

  msgStr.split('').forEach(char => {
    const s = document.createElement('div');
    s.className = 'm-slot';
    s.dataset.char = char;
    slots.appendChild(s);
  });

  const slotElements = $$('.m-slot', slots);

  l9Spawner = setInterval(() => {
    if (l9Collected >= msgStr.length) return;

    // Spawn next required letter + some random letters
    const targetChar = msgStr[l9Collected];
    const isTarget = Math.random() > 0.4;
    const charToSpawn = isTarget ? targetChar : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[randInt(0, 25)];

    const l = document.createElement('div');
    l.className = 'catch-item';
    l.textContent = charToSpawn;
    l.setAttribute('data-cursor', 'hover');
    l.style.left = `${randInt(5, 90)}%`;
    l.style.top = `-40px`;
    l.style.transition = 'top 3s linear';

    area.appendChild(l);

    // Fall animation
    setTimeout(() => { l.style.top = '110%'; }, 50);

    l.addEventListener('click', () => {
      l.remove();
      if (charToSpawn === msgStr[l9Collected]) {
        slotElements[l9Collected].textContent = charToSpawn;
        l9Collected++;
        addPoints('points', 5);
        burstConfetti({ particleCount: 15, spread: 30 });

        if (l9Collected >= msgStr.length) {
          clearInterval(l9Spawner);
          unlockAchievement('bday_champ', 'Birthday Champion');
          setTimeout(completeLevel, 2000);
        }
      }
    });

    setTimeout(() => l.remove(), 3000);
  }, 600);
}


/* ================================================================
   6. FINAL REVEAL (Level 16)
================================================================ */
function revealFinale() {
  $('#adventure-journey').classList.add('hidden');
  
  // Cinematic Overlay
  const overlay = $('#cinematic-overlay');
  const ctext = $('#cinematic-text');
  overlay.classList.remove('hidden');
  ctext.classList.remove('hidden');
  
  setTimeout(() => {
    overlay.classList.add('active');
    ctext.classList.add('active');
    
    setTimeout(() => {
      overlay.classList.remove('active');
      ctext.classList.remove('active');
      
      setTimeout(() => {
        overlay.classList.add('hidden');
        ctext.classList.add('hidden');
        $('#finale-sections').classList.remove('hidden');
        
        // Huge fireworks
        burstConfetti({particleCount: 200, spread: 160});
        setTimeout(() => burstConfetti({particleCount: 200, spread: 160}), 500);
        setTimeout(() => burstConfetti({particleCount: 200, spread: 160}), 1000);
        
        if(window.magic) window.magic.noorSpeak("Jadoo poora hua! Happy Birthday!");
        
        if(typeof ScrollTrigger !== 'undefined') {
          ScrollTrigger.refresh();
        }
        
        $('#story').scrollIntoView({ behavior: 'smooth' });
      }, 2000);
    }, 5000); // 5 seconds of cinematic text
  }, 100);
}


/* ================================================================
   7. INITIALIZATION (Landing & Misc)
================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  loadProgress();
  updateHUD();

  // Loader
  setTimeout(() => {
    $('#loader').style.opacity = '0';
    setTimeout(() => $('#loader').classList.add('hidden'), 800);

    // Typed text
    if (typeof Typed !== 'undefined') {
      new Typed('#typed-text', {
        strings: ['Happy Birthday Rimsha ❤️'],
        typeSpeed: 75,
        startDelay: 500,
        showCursor: true,
        onComplete: () => {
          $('#teaser-text').classList.add('visible');
          setTimeout(() => burstConfetti(), 300);
        }
      });
    } else {
      $('#typed-text').textContent = 'Happy Birthday Rimsha ❤️';
      $('#teaser-text').classList.add('visible');
    }
  }, 1500);

  // Start Journey Button
  $('#start-journey-btn').addEventListener('click', () => {
    startAdventure();
  });

  // Reset Progress Button
  $('#reset-progress-btn').addEventListener('click', () => {
    if (confirm('Kya aap waqai progress reset karna chahte hain?')) resetProgress();
  });

  // Original Cake/Gift Interactions
  setupOriginalInteractions();

  // Particle Canvas Background
  initParticles();
});


/* ================================================================
   8. ORIGINAL INTERACTIONS (Gift, Cake, Music)
================================================================ */
function setupOriginalInteractions() {
  // Music
  const MUSIC_URL = 'happy-birthday.mp3';
  const audio = new Audio(MUSIC_URL);
  audio.loop = true; audio.volume = 0.35;
  let isPlaying = false;
  const musicBtn = $('#music-btn');

  musicBtn.addEventListener('click', () => {
    if (isPlaying) {
      audio.pause();
      musicBtn.classList.remove('playing');
      $('.music-icon', musicBtn).textContent = '🎵';
      $('.music-label', musicBtn).textContent = 'Music Chalao';
    } else {
      audio.play().catch(e => console.log('Autoplay blocked'));
      musicBtn.classList.add('playing');
      $('.music-icon', musicBtn).textContent = '🔊';
      $('.music-label', musicBtn).textContent = 'Music Band Karo';
    }
    isPlaying = !isPlaying;
  });

  // Gift
  const giftBtn = $('#gift-btn');
  const giftBox = $('#gift-box');
  const giftStage = $('#gift-stage');
  const cakeStage = $('#cake-stage');
  let giftOpened = false;

  giftBtn?.addEventListener('click', () => {
    if (giftOpened) return;
    giftOpened = true;
    giftBox.classList.add('open');
    setTimeout(() => burstConfetti({ particleCount: 150, spread: 100 }), 600);
    setTimeout(() => {
      giftStage.style.display = 'none';
      cakeStage.removeAttribute('hidden');
      cakeStage.classList.remove('hidden');
      burstConfetti({ particleCount: 200 });
    }, 1500);
  });

  // Cake Easter Egg
  const cakeBtn = $('#cake-btn');
  const easterEgg = $('#easter-egg');
  const easterClose = $('#easter-close');
  let cakeClicks = 0;

  cakeBtn?.addEventListener('click', () => {
    cakeClicks++;
    cakeBtn.style.transform = 'scale(1.08)';
    setTimeout(() => { cakeBtn.style.transform = ''; }, 180);
    burstConfetti({ particleCount: 20, spread: 40 });

    if (cakeClicks >= 5) {
      cakeClicks = 0;
      easterEgg.removeAttribute('hidden');
      setTimeout(() => burstConfetti({ particleCount: 300, spread: 160 }), 300);
    }
  });

  easterClose?.addEventListener('click', () => {
    easterEgg.setAttribute('hidden', '');
    burstConfetti({ particleCount: 50 });
  });
}


/* ================================================================
   9. BACKGROUND PARTICLES
================================================================ */
function initParticles() {
  const c = $('#particle-canvas');
  const ctx = c.getContext('2d');
  let p = [];
  const colors = ['rgba(255,110,180,0.5)', 'rgba(199,125,255,0.5)', 'rgba(110,181,255,0.5)'];

  function resize() {
    c.width = window.innerWidth;
    c.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  for (let i = 0; i < 80; i++) {
    p.push({
      x: rand(0, c.width), y: rand(0, c.height),
      r: rand(1, 2.5),
      dx: rand(-0.2, 0.2), dy: rand(-0.1, -0.5),
      c: colors[randInt(0, colors.length)]
    });
  }

  function draw() {
    ctx.clearRect(0, 0, c.width, c.height);
    p.forEach(pt => {
      pt.x += pt.dx; pt.y += pt.dy;
      if (pt.y < 0) { pt.y = c.height; pt.x = rand(0, c.width); }
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2);
      ctx.fillStyle = pt.c;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
}
