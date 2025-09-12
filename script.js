// ===== Ambient Canvas: Sakura + Snowflakes + Gold Sparks =====
const canvas = document.getElementById('sakura');
const ctx = canvas.getContext('2d');

let W, H;
let petals = [];
let flakes = [];
let sparks = [];

function resize(){
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

/* --- Sakura petals --- */
function makePetal(){
  const size = Math.random()*10 + 6;
  return {
    x: Math.random()*W,
    y: -20,
    vx: Math.random()*0.6 - 0.3,
    vy: Math.random()*0.8 + 0.6,
    rot: Math.random()*Math.PI*2,
    vr: (Math.random()-0.5)*0.02,
    size,
    sway: Math.random()*0.6 + 0.2,
    alpha: Math.random()*0.3 + 0.6
  };
}
function drawPetal(p){
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot);
  const s = p.size;
  const g = ctx.createRadialGradient(0,0,1, 0,0,s);
  g.addColorStop(0, `rgba(255,184,200,${p.alpha})`);
  g.addColorStop(1, `rgba(255,140,170,${p.alpha*0.85})`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(0, -s*0.6);
  ctx.bezierCurveTo(s, -s, s, s, 0, s*0.8);
  ctx.bezierCurveTo(-s, s, -s, -s, 0, -s*0.6);
  ctx.fill();
  ctx.restore();
}

/* --- Snowflakes (pure canvas, no image) --- */
function makeFlake(){
  const r = Math.random()*2.3 + 1.2;
  return {
    x: Math.random()*W,
    y: -12,
    r,
    vx: (Math.random()-0.5)*0.35,
    vy: Math.random()*0.7 + 0.4,
    swayPhase: Math.random()*Math.PI*2,
    rot: Math.random()*Math.PI*2,
    vr: (Math.random()-0.5)*0.01
  };
}
function drawFlake(f, t){
  // gentle horizontal sway
  const sway = Math.sin(t*0.001 + f.swayPhase) * 0.6;
  f.x += f.vx + sway*0.15;
  f.y += f.vy;
  f.rot += f.vr;

  // simple six-armed flake + core
  ctx.save();
  ctx.translate(f.x, f.y);
  ctx.rotate(f.rot);
  ctx.globalAlpha = 0.9;
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = 1;
  const L = f.r*2.2;
  for(let i=0;i<3;i++){
    ctx.beginPath();
    ctx.moveTo(-L,0); ctx.lineTo(L,0);
    ctx.stroke();
    ctx.rotate(Math.PI/3);
  }
  ctx.beginPath();
  ctx.arc(0,0,f.r*0.6,0,Math.PI*2);
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.fill();
  ctx.restore();
}

/* --- Gold sparks (motes) --- */
function makeSpark(){
  return {
    x: Math.random()*W,
    y: Math.random()*H*0.85 + H*0.05,
    vx: (Math.random()-0.5)*0.2,
    vy: -(Math.random()*0.4 + 0.1),
    life: Math.random()*120 + 80,
    age: 0,
    r: Math.random()*1.8 + 0.8
  };
}
function drawSpark(s){
  const a = 1 - s.age/s.life;
  ctx.save();
  ctx.fillStyle = `rgba(212,175,55,${0.75*a})`;
  ctx.shadowBlur = 10;
  ctx.shadowColor = 'rgba(212,175,55,.9)';
  ctx.beginPath();
  ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
  ctx.fill();
  ctx.restore();
}

/* --- Main loop --- */
let lastSpawn = 0;
function tick(t){
  ctx.clearRect(0,0,W,H);

  // spawn petals
  if (t - lastSpawn > 40 && petals.length < 110){
    petals.push(makePetal());
    lastSpawn = t;
  }
  for (let i=petals.length-1; i>=0; i--){
    const p = petals[i];
    p.x += p.vx + Math.sin(t*0.001 + i)*p.sway*0.2;
    p.y += p.vy;
    p.rot += p.vr;
    drawPetal(p);
    if (p.y > H + 40) petals.splice(i,1);
  }

  // spawn flakes
  if (Math.random() < 0.28 && flakes.length < 160) flakes.push(makeFlake());
  for (let i=flakes.length-1; i>=0; i--){
    const f = flakes[i];
    drawFlake(f, t);
    if (f.y > H + 20) flakes.splice(i,1);
  }

  // spawn sparks
  if (Math.random() < 0.15 && sparks.length < 120) sparks.push(makeSpark());
  for (let i=sparks.length-1; i>=0; i--){
    const s = sparks[i];
    s.x += s.vx; s.y += s.vy; s.age++;
    drawSpark(s);
    if (s.age > s.life) sparks.splice(i,1);
  }

  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

/* ===== UI bits ===== */
document.getElementById('year').textContent = new Date().getFullYear();

// Read Sample toggle
const sampleBtn = document.getElementById('readSampleBtn');
const sampleBox = document.getElementById('sampleBox');
if (sampleBtn && sampleBox){
  sampleBtn.addEventListener('click', () => sampleBox.classList.toggle('open'));
}

// Background music (autoplay after first gesture + toggle)
const bgm = document.getElementById('bgm');
const musicBtn = document.getElementById('musicToggle');
if (bgm && musicBtn) {
  bgm.volume = 0.25;

  const setBtn = () => {
    // change the labels to your preferred wording if you like
    musicBtn.textContent = bgm.paused ? 'Play Xinzhi’s Theme (OST)' : 'Pause Xinzhi’s Theme';
  };

  // Try to play immediately if allowed
  bgm.play().then(setBtn).catch(setBtn);

  // Start on first user interaction (for autoplay-blocking browsers)
  const unlock = () => {
    bgm.play().then(setBtn).catch(()=>{});
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('keydown', unlock);
    window.removeEventListener('touchstart', unlock);
  };
  window.addEventListener('pointerdown', unlock, { once:true });
  window.addEventListener('keydown',   unlock, { once:true });
  window.addEventListener('touchstart',unlock, { once:true });

  // Manual toggle
  musicBtn.addEventListener('click', () => {
    if (bgm.paused) bgm.play().then(setBtn);
    else { bgm.pause(); setBtn(); }
  });
}
