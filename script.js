/* ===== FIRELIES (GOLD SPARKS) + music + sample toggle + scroll reveal ===== */

// ---- Canvas setup
const canvas = document.getElementById('fireflies');
const ctx = canvas.getContext('2d');
function resize(){ canvas.width = innerWidth; canvas.height = innerHeight; }
addEventListener('resize', resize); resize();

// ---- Fireflies
const FIREFLIES_MAX = 120;
const F = [];
function makeFly(){
  return {
    x: Math.random()*canvas.width,
    y: Math.random()*canvas.height,
    vx:(Math.random()-0.5)*0.12,
    vy:(Math.random()-0.5)*0.12,
    r: Math.random()*1.6 + 0.8,
    baseA: Math.random()*0.35 + 0.35,
    tw: Math.random()*0.002 + 0.001,
    ph: Math.random()*Math.PI*2
  };
}
function drawFly(f, t){
  f.x += f.vx; f.y += f.vy;
  if (f.x < -10) f.x = canvas.width+10; else if (f.x > canvas.width+10) f.x = -10;
  if (f.y < -10) f.y = canvas.height+10; else if (f.y > canvas.height+10) f.y = -10;

  const a = f.baseA * (0.55 + 0.45*Math.sin(t*f.tw + f.ph));
  ctx.save();
  ctx.globalAlpha = a;
  ctx.fillStyle = 'rgb(212,175,55)';
  ctx.shadowBlur = 12; ctx.shadowColor = 'rgba(212,175,55,.9)';
  ctx.beginPath(); ctx.arc(f.x,f.y,f.r,0,Math.PI*2); ctx.fill();
  ctx.restore();
}
function loop(t=0){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  while (F.length < FIREFLIES_MAX) F.push(makeFly());
  for (let i=0;i<F.length;i++) drawFly(F[i], t);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// ---- Sample toggle (starts open per your request)
const sampleBtn = document.getElementById('readSampleBtn');
const sampleBox = document.getElementById('sampleBox');
if (sampleBtn && sampleBox){
  sampleBtn.addEventListener('click', ()=> sampleBox.classList.toggle('open'));
}

// ---- Year
const yEl = document.getElementById('year'); if (yEl) yEl.textContent = new Date().getFullYear();

// ---- Music (robust)
const bgm = document.getElementById('bgm');
const musicBtn = document.getElementById('musicToggle');
if (bgm && musicBtn){
  bgm.volume = 0.25;
  const setBtn = () => musicBtn.textContent = bgm.paused ? 'Play Xinzhi’s Theme (OST)' : 'Pause Xinzhi’s Theme';
  bgm.play().then(setBtn).catch(setBtn);
  const unlock = () => { bgm.play().then(setBtn).catch(()=>{}); cleanup(); };
  const cleanup = () => {
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('keydown', unlock);
    window.removeEventListener('touchstart', unlock);
  };
  window.addEventListener('pointerdown', unlock, { once:true });
  window.addEventListener('keydown',   unlock, { once:true });
  window.addEventListener('touchstart',unlock, { once:true });
  musicBtn.addEventListener('click', () => { if (bgm.paused) bgm.play().then(setBtn); else { bgm.pause(); setBtn(); } });
}

// ---- Reveal on scroll
const reveals = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries)=>{
  for (const e of entries){
    if (e.isIntersecting){
      const delay = parseInt(e.target.dataset.delay || '0', 10);
      setTimeout(()=> e.target.classList.add('show'), delay);
      io.unobserve(e.target);
    }
  }
},{ rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
reveals.forEach(el => io.observe(el));
