/* ================================================================
   GAMES ENGINE (games.js)
   Logic for L10 to L15
================================================================ */

// We hook these into the global initLevel in script.js
window.initExtraLevels = function(level) {
  if(level === 10) initLevel10();
  if(level === 11) initLevel11();
  if(level === 12) initLevel12();
  if(level === 13) initLevel13();
  if(level === 14) initLevel14();
  if(level === 15) initLevel15();
};

/* --- L10: CONSTELLATIONS --- */
function initLevel10() {
  const container = $('#stars-container');
  const canvas = $('#constellation-canvas');
  const ctx = canvas.getContext('2d');
  const msg = $('#l10-msg');
  container.innerHTML = '';
  
  canvas.width = container.offsetWidth;
  canvas.height = container.offsetHeight;
  
  const starsData = [
    {x: 20, y: 30}, {x: 40, y: 70}, {x: 60, y: 20}, {x: 80, y: 60}
  ];
  
  let clickedStars = [];
  
  starsData.forEach((pos, i) => {
    const s = document.createElement('div');
    s.className = 'c-star';
    s.style.left = `${pos.x}%`;
    s.style.top = `${pos.y}%`;
    s.setAttribute('data-cursor', 'star');
    
    s.onclick = () => {
      if(s.classList.contains('active')) return;
      s.classList.add('active');
      clickedStars.push(pos);
      burstConfetti({particleCount: 15, spread: 30});
      
      // Draw lines
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 2;
      clickedStars.forEach((p, idx) => {
        const px = (p.x / 100) * canvas.width;
        const py = (p.y / 100) * canvas.height;
        if(idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
      
      if(clickedStars.length === starsData.length) {
        msg.textContent = "Khoobsurat constellation! ✨";
        addPoints('stars', 5);
        if(window.magic) window.magic.noorSpeak("Wah! Asman kitna pyara lag raha hai.");
        setTimeout(completeLevel, 2000);
      }
    };
    container.appendChild(s);
  });
}

/* --- L11: PHOTO GALLERY --- */
function initLevel11() {
  const gallery = $('#polaroid-gallery');
  const nextBtn = $('#l11-next');
  gallery.innerHTML = '';
  
  const photos = [
    { src: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=300&q=80', cap: 'Party Time! 🎉', r: -10, x: 10, y: 10 },
    { src: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=300&q=80', cap: 'Besties ❤️', r: 5, x: 150, y: 50 },
    { src: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=300&q=80', cap: 'Memories ✨', r: 15, x: 300, y: 20 }
  ];
  
  let viewed = 0;
  
  photos.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'polaroid';
    card.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.r}deg)`;
    card.setAttribute('data-cursor', 'hover');
    card.innerHTML = `<img src="${p.src}" alt="Memory" /> <div class="caption">${p.cap}</div>`;
    
    card.onclick = () => {
      if(card.dataset.viewed) return;
      card.dataset.viewed = "true";
      viewed++;
      burstConfetti({particleCount: 20});
      if(viewed === photos.length) {
        nextBtn.classList.remove('hidden');
        if(window.magic) window.magic.noorSpeak("Yeh yaadein hamesha zinda rahengi.");
      }
    };
    gallery.appendChild(card);
  });
  
  nextBtn.onclick = () => completeLevel();
}

/* --- L12: SCRAPBOOK --- */
function initLevel12() {
  const pages = $$('.sb-page');
  const next = $('#sb-next');
  const prev = $('#sb-prev');
  const counter = $('#sb-counter');
  const finishBtn = $('#l12-next');
  let current = 0;
  
  function update() {
    pages.forEach((p, i) => {
      if(i === current) {
        p.classList.remove('hidden');
        p.classList.add('active');
      } else {
        p.classList.remove('active');
        p.classList.add('hidden');
      }
    });
    counter.textContent = `${current + 1} / ${pages.length}`;
    prev.disabled = current === 0;
    
    if(current === pages.length - 1) {
      next.disabled = true;
      finishBtn.classList.remove('hidden');
      if(window.magic) window.magic.noorSpeak("Kitni pyari kitab hai!");
    } else {
      next.disabled = false;
    }
  }
  
  next.onclick = () => { current++; update(); };
  prev.onclick = () => { current--; update(); };
  finishBtn.onclick = () => completeLevel();
  update();
}

/* --- L13: TREASURE HUNT --- */
function initLevel13() {
  const chest = $('#treasure-chest');
  const msg = $('#l13-msg');
  const hud = $('#keys-hud');
  let keysFound = 0;
  
  chest.dataset.keys = "0";
  
  // Spawn 3 keys randomly on the screen (fixed coords so they are outside the container)
  for(let i=0; i<3; i++) {
    const key = document.createElement('div');
    key.className = 'hidden-key';
    key.textContent = '🔑';
    key.style.top = `${randInt(10, 90)}%`;
    key.style.left = `${randInt(5, 95)}%`;
    
    key.onclick = () => {
      key.remove();
      keysFound++;
      chest.dataset.keys = keysFound;
      hud.textContent = `Keys: ${keysFound} / 3`;
      burstConfetti({particleCount: 15});
      if(window.magic) window.magic.noorSpeak("Chabi mil gayi!");
      
      if(keysFound === 3) {
        chest.classList.add('open');
        chest.textContent = '🔓';
        msg.textContent = "Khazana khul gaya!";
        addPoints('xp', 20);
        setTimeout(completeLevel, 2000);
      }
    };
    document.body.appendChild(key); // Append to body so they are truly hidden anywhere
  }
}

/* --- L14: WISH TREE --- */
function initLevel14() {
  const trunk = $('.tree-trunk');
  const leaves = $('#tree-leaves');
  const prog = $('#l14-progress');
  let clicks = 0;
  leaves.innerHTML = '';
  
  trunk.onclick = () => {
    clicks++;
    prog.textContent = `Water: ${clicks * 10}%`;
    burstConfetti({particleCount: 10, colors: ['#a8e6cf', '#dcedc1']});
    
    // Add a leaf
    const leaf = document.createElement('div');
    leaf.className = 'leaf';
    leaf.textContent = Math.random() > 0.3 ? '🍃' : '🌸';
    if(leaf.textContent === '🌸') leaf.classList.add('bloom');
    leaf.style.left = `${randInt(10, 90)}%`;
    leaf.style.top = `${randInt(10, 90)}%`;
    leaves.appendChild(leaf);
    
    if(clicks >= 10) {
      trunk.onclick = null;
      prog.textContent = "Tree Poora Grow Ho Gaya! 🌸🌳";
      if(window.magic) window.magic.noorSpeak("SubhanAllah! Kitna pyara darakht hai.");
      setTimeout(completeLevel, 2000);
    }
  };
}

/* --- L15: TIME CAPSULE --- */
function initLevel15() {
  const btn = $('#time-capsule-btn');
  btn.onclick = () => {
    btn.onclick = null;
    btn.textContent = '🔓 Khol Diya!';
    burstConfetti({particleCount: 200, spread: 150});
    if(window.magic) window.magic.noorSpeak("Final surprise ka waqt aa gaya!");
    setTimeout(completeLevel, 1500);
  };
}
