// ===== Canvas ambience: sakura + butterflies + gold sparks =====
const canvas = document.getElementById('sakura');
const ctx = canvas.getContext('2d');

let W, H;
let petals = [];
let butterflies = [];
let sparks = [];

/* Ensure canvas stays correct size */
function resize(){ W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
window.addEventListener('resize', resize); resize();

/* --- Sakura petals --- */
function makePetal(){
  const size = Math.random()*10 + 6;
  return { x: Math.random()*W, y: -20, vx: Math.random()*0.6 - 0.3, vy: Math.random()*0.8 + 0.6,
           rot: Math.random()*Math.PI*2, vr:(Math.random()-0.5)*0.02, size, sway:Math.random()*0.6+0.2, alpha:Math.random()*0.3+0.6 };
}
function drawPetal(p){
  ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot);
  const s = p.size;
  const g = ctx.createRadialGradient(0,0,1,0,0,s);
  g.addColorStop(0,`rgba(255,184,200,${p.alpha})`);
  g.addColorStop(1,`rgba(255,140,170,${p.alpha*0.85})`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(0,-s*0.6);
  ctx.bezierCurveTo(s,-s,s,s,0,s*0.8);
  ctx.bezierCurveTo(-s,s,-s,-s,0,-s*0.6);
  ctx.fill();
  ctx.restore();
}

/* --- Butterflies (image if available, vector fallback otherwise) --- */
const butterflyImg = new Image();
let butterflyReady = false;
butterflyImg.onload = () => butterflyReady = true;
butterflyImg.src = 'assets/butterfly.png';

function makeButterfly(){
  return { x: Math.random()*W, y: H+30, vx: Math.random()*0.5-0.25, vy: -(Math.random()*0.8+0.6),
           size: Math.random()*26+16, phase: Math.random()*Math.PI*2 };
}
function drawButterfly(b,t){
  const flap = Math.sin(t*0.005 + b.phase)*0.25 + 1;
  const w = b.size*flap, h = b.size;

  ctx.save(); ctx.translate(b.x,b.y); ctx.globalAlpha = 0.9;

  if (butterflyReady){
    ctx.drawImage(butterflyImg, -w/2, -h/2, w, h);
  } else {
    // vector fallback (pink wings with gold body)
    ctx.fillStyle = 'rgba(255,150,170,0.95)';
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.bezierCurveTo(-w*0.9,-h*0.8, -w*0.9,h*0.8, 0,0);
    ctx.bezierCurveTo(w*0.9,-h*0.8,  w*0.9,h*0.8, 0,0);
    ctx.fill();
    ctx.fillStyle = 'rgba(212,175,55,0.9)';
    ctx.fillRect(-2,-h*0.25,4,h*0.5);
  }

  ctx.restore(); ctx.globalAlpha = 1;
}

/* --- Gold sparks --- */
function makeSpark(){ return { x: Math.random()*W, y: Math.random()*H*0.85 + H*0.05, vx:(Math.random()-0.5)*0.2, vy: -(Math.random()*0.4+0.1), life: Math.random()*120+80, age:0, r: Math.random()*1.8+0.8 }; }
function drawSpark(s){
  const a = 1 - s.age/s.life;
  ctx.save(); ctx.fillStyle = `rgba(212,175,55,${0.75*a})`;
  ctx.shadowBlur = 10; ctx.shadowColor = 'rgba(212,175,55,.9)';
  ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fill(); ctx.restore();
}

/* --- Main loop --- */
let last = 0;
function tick(t){
  ctx.clearRect(0,0,W,H);

  // petals
  if(t - last > 40 && petals.length < 120){ petals.push(makePetal()); last = t; }
  for(let i=petals.length-1;i>=0;i--){
    const p=petals[i]; p.x += p.vx + Math.sin(t*0.001 + i)*p.sway*0.2; p.y+=p.vy; p.rot+=p.vr; drawPetal(p);
    if(p.y > H+40) petals.splice(i,1);
  }

  // butterflies
  if(Math.random() < 0.02 && butterflies.length < 28) butterflies.push(makeButterfly());
  for(let i=butterflies.length-1;i>=0;i--){
    const b = butterflies[i]; b.x += b.vx + Math.sin(t*0.002 + i)*0.5; b.y += b.vy; drawButterfly(b,t);
    if(b.y < -50) butterflies.splice(i,1);
  }

  // sparks
  if(Math.random() < 0.15 && sparks.length < 120) sparks.push(makeSpark());
  for(let i=sparks.length-1;i>=0;i--){
    const s = sparks[i]; s.x += s.vx; s.y += s.vy; s.age++; drawSpark(s);
    if(s.age > s.life) sparks.splice(i,1);
  }

  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

/* ===== UI ===== */
function subscribe(e){ e.preventDefault(); alert('Follow on Wattpad instead of email — see links below.'); e.target.reset(); }
document.getElementById('year').textContent = new Date().getFullYear();

// Read Sample toggle
const sampleBtn = document.getElementById('readSampleBtn');
const sampleBox = document.getElementById('sampleBox');
if(sampleBtn && sampleBox){ sampleBtn.addEventListener('click', () => sampleBox.classList.toggle('open')); }

// Background music (autoplay after first gesture + toggle)
const bgm = document.getElementById('bgm');
const musicBtn = document.getElementById('musicToggle');
if (bgm && musicBtn) {
  bgm.volume = 0.25;
  const setBtn = () => musicBtn.textContent = bgm.paused ? 'Play music' : 'Pause music';
  bgm.play().then(setBtn).catch(setBtn);
  const unlock = () => { bgm.play().then(setBtn).catch(()=>{}); window.removeEventListener('pointerdown', unlock); window.removeEventListener('keydown', unlock); window.removeEventListener('touchstart', unlock); };
  window.addEventListener('pointerdown', unlock, { once:true });
  window.addEventListener('keydown',   unlock, { once:true });
  window.addEventListener('touchstart',unlock, { once:true });
  musicBtn.addEventListener('click', () => { if (bgm.paused) bgm.play().then(setBtn); else { bgm.pause(); setBtn(); } });
}
