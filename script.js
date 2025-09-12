// ===== Canvas Ambience: Butterflies + Gold Sparks =====
const canvas = document.getElementById('sakura');
const ctx = canvas.getContext('2d');

let W, H;
let butterflies = [];
let sparks = [];

function resize(){
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

/* --- Butterflies (from assets/butterfly.png) --- */
const butterflyImg = new Image();
let butterflyReady = false;
butterflyImg.onload = () => (butterflyReady = true);
butterflyImg.src = 'assets/butterfly.png';

// Tweak these to taste
const MAX_BUTTERFLIES = 14;   // how many on screen
const SPAWN_CHANCE     = 0.015; // spawn probability per frame
const SPEED_Y_RANGE    = [0.35, 0.9]; // upward speed
const SIZE_RANGE       = [26, 44];    // px

function rand(a,b){ return a + Math.random()*(b-a); }

function makeButterfly(){
  return {
    x: Math.random()*W,
    y: H + 40,                          // start off-screen bottom
    size: rand(SIZE_RANGE[0], SIZE_RANGE[1]),
    vx: (Math.random()-0.5)*0.5,        // gentle drift
    vy: -rand(SPEED_Y_RANGE[0], SPEED_Y_RANGE[1]),
    rot: Math.random()*Math.PI*2,
    vr: (Math.random()-0.5)*0.02,
    sway: Math.random()*1.1,            // lateral wobble strength
    phase: Math.random()*Math.PI*2      // desync their flaps/paths
  };
}

function drawButterfly(b, t){
  // update
  b.x += b.vx + Math.sin(t*0.001 + b.phase)*b.sway*0.5;
  b.y += b.vy;
  b.rot += b.vr;

  // draw
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.rotate(Math.sin(t*0.005 + b.phase)*0.4); // subtle “flap” tilt
  if (butterflyReady){
    ctx.drawImage(butterflyImg, -b.size/2, -b.size/2, b.size, b.size);
  } else {
    // vector fallback if image hasn’t loaded yet
    ctx.fillStyle = 'rgba(255,150,170,0.95)';
    const w=b.size, h=b.size;
    ctx.beginPath(); ctx.moveTo(0,0);
    ctx.bezierCurveTo(-w*0.45,-h*0.6, -w*0.55,h*0.6, 0,0);
    ctx.bezierCurveTo(w*0.45,-h*0.6,  w*0.55,h*0.6, 0,0);
    ctx.fill();
    ctx.fillStyle='rgba(212,175,55,0.9)'; ctx.fillRect(-2,-h*0.25,4,h*0.5);
  }
  ctx.restore();
}

/* --- Gold sparks (tiny rising motes) --- */
function makeSpark(){
  return {
    x: Math.random()*W,
    y: Math.random()*H*0.9,
    vx:(Math.random()-0.5)*0.2,
    vy: -(Math.random()*0.4+0.1),
    life: Math.random()*120+80,
    age:0,
    r: Math.random()*1.5+0.6
  };
}
function drawSpark(s){
  const a = 1 - s.age/s.life;
  ctx.save();
  ctx.fillStyle = `rgba(212,175,55,${0.75*a})`;
  ctx.shadowBlur = 10;
  ctx.shadowColor = 'rgba(212,175,55,.9)';
  ctx.beginPath();
  ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
  ctx.fill();
  ctx.restore();
}

/* --- Main loop --- */
function tick(t=0){
  ctx.clearRect(0,0,W,H);

  // butterflies
  if (Math.random() < SPAWN_CHANCE && butterflies.length < MAX_BUTTERFLIES)
    butterflies.push(makeButterfly());

  for (let i=butterflies.length-1; i>=0; i--){
    const b = butterflies[i];
    drawButterfly(b, t);
    if (b.y < -60) butterflies.splice(i,1);
  }

  // sparks
  if (Math.random()<0.12 && sparks.length<120) sparks.push(makeSpark());
  for (let i=sparks.length-1;i>=0;i--){
    const s=sparks[i]; s.x+=s.vx; s.y+=s.vy; s.age++;
    drawSpark(s);
    if (s.age > s.life) sparks.splice(i,1);
  }

  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

/* ===== UI bits (year, sample toggle, music toggle) ===== */
const yEl = document.getElementById('year'); if (yEl) yEl.textContent = new Date().getFullYear();

const sampleBtn = document.getElementById('readSampleBtn');
const sampleBox = document.getElementById('sampleBox');
if(sampleBtn && sampleBox){ sampleBtn.addEventListener('click', () => sampleBox.classList.toggle('open')); }

const bgm = document.getElementById('bgm');
const musicBtn = document.getElementById('musicToggle');
if (bgm && musicBtn) {
  bgm.volume = 0.25;
  const setBtn = () => musicBtn.textContent = bgm.paused ? 'Play Xinzhi’s Theme (OST)' : 'Pause Xinzhi’s Theme';
  bgm.play().then(setBtn).catch(setBtn);
  const unlock = () => { bgm.play().then(setBtn).catch(()=>{}); };
  window.addEventListener('pointerdown', unlock, {once:true});
  window.addEventListener('keydown', unlock, {once:true});
  window.addEventListener('touchstart', unlock, {once:true});
  musicBtn.addEventListener('click', () => { if (bgm.paused) bgm.play().then(setBtn); else { bgm.pause(); setBtn(); } });
}
