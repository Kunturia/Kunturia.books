/* ===== Fireflies + toggles + resilient music player + reveal ===== */

/* ---------- Ambient fireflies ---------- */
const canvas = document.getElementById('ambient');
const ctx = canvas.getContext('2d');

function size(){ canvas.width = innerWidth; canvas.height = innerHeight; }
addEventListener('resize', size); size();

const MAX_FIREFLIES = 110;
const flies = [];
function mkFly(){
  return {
    x: Math.random()*canvas.width,
    y: Math.random()*canvas.height,
    vx:(Math.random()-0.5)*0.12,
    vy:(Math.random()-0.5)*0.12,
    r: Math.random()*1.5 + 0.8,
    a: Math.random()*0.35 + 0.35,
    tw: Math.random()*0.002 + 0.001,
    ph: Math.random()*Math.PI*2
  };
}
function drawFly(f, t){
  f.x+=f.vx; f.y+=f.vy;
  if (f.x<-10) f.x=canvas.width+10; else if (f.x>canvas.width+10) f.x=-10;
  if (f.y<-10) f.y=canvas.height+10; else if (f.y>canvas.height+10) f.y=-10;

  const alpha = f.a*(0.55+0.45*Math.sin(t*f.tw+f.ph));
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = 'rgb(212,175,55)';
  ctx.shadowBlur = 12; ctx.shadowColor='rgba(212,175,55,.9)';
  ctx.beginPath(); ctx.arc(f.x,f.y,f.r,0,Math.PI*2); ctx.fill();
  ctx.restore();
}
function loop(t=0){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  while (flies.length<MAX_FIREFLIES) flies.push(mkFly());
  for (let i=0;i<flies.length;i++) drawFly(flies[i],t);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

/* ---------- Year ---------- */
const y = document.getElementById('year');
if (y) y.textContent = new Date().getFullYear();

/* ---------- Prologue & Sample toggles ---------- */
function makeToggle(btnId, boxId, labels=['Read','Hide']){
  const btn=document.getElementById(btnId);
  const box=document.getElementById(boxId);
  if (!btn||!box) return;

  const base = btn.textContent.replace(/^Read |Hide /,'');
  const set = (open)=>{
    btn.setAttribute('aria-expanded', String(open));
    btn.textContent = (open?labels[1]:labels[0]) + ' ' + base;
  };

  box.hidden = true; set(false);
  btn.addEventListener('click', ()=>{ box.hidden=!box.hidden; set(!box.hidden); });
}
makeToggle('prologueBtn','prologueBox');
makeToggle('sampleBtn','sampleBox');

/* ---------- Resilient Playlist Music Player ---------- */
/* Using your current filenames (repo root): */
const PLAYLIST = [
  { src: "bgm.mp3",              title: "Xinzhi’s Theme (OST)" },
  { src: "Da Yu.mp3",            title: "Da Yu – Zhou Shen" },
  { src: "Playing Da Yu.mp3",    title: "Playing Da Yu – Zhou Shen" },
  { src: "Together forever.mp3", title: "Together Forever – Zhou Shen" }
];

const bgm       = document.getElementById('bgm');
const titleEl   = document.getElementById('track-title');
const statusEl  = document.getElementById('currentTrack');
const playBtn   = document.getElementById('playPauseBtn');
const prevBtn   = document.getElementById('prevBtn');
const nextBtn   = document.getElementById('nextBtn');
const toggleBtn = document.getElementById('musicToggle');

let idx = 0;
let resolvedSrc = null;

/* Try ./, ../, ../../ for GitHub Pages “/docs/” setups, etc. */
async function resolvePath(raw){
  const encoded = encodeURI(raw);
  const bases = ["", "../", "../../"];
  for (const b of bases){
    const url = b + encoded;
    try{
      const r = await fetch(url, { method: "HEAD", cache: "no-store" });
      if (r.ok) return url;
    }catch(_){} // ignore
  }
  return encoded; // fallback (may still fail, but we’ll report it)
}

async function load(i){
  idx = (i + PLAYLIST.length) % PLAYLIST.length;
  const tr = PLAYLIST[idx];
  titleEl.textContent = tr.title;
  if (statusEl) statusEl.textContent = "Loading… " + tr.title;

  resolvedSrc = await resolvePath(tr.src);
  bgm.src = resolvedSrc;
  bgm.load();
  if (statusEl) statusEl.textContent = "Ready: " + tr.title + " (" + resolvedSrc + ")";
  syncButtons(false);
}

function syncButtons(isPlaying){
  playBtn.textContent = isPlaying ? "⏸" : "▶";
  if (toggleBtn){
    toggleBtn.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
    toggleBtn.textContent = isPlaying ? "Pause Music" : "Play Music";
  }
}

async function tryPlay(){
  try{
    await bgm.play();
    if (statusEl) statusEl.textContent = "Now playing: " + PLAYLIST[idx].title;
    syncButtons(true);
  }catch(err){
    const msg = (err && (err.name || err.message)) ? `${err.name || ""} ${err.message || ""}`.trim() : "Unknown";
    if (statusEl) statusEl.textContent = `Could not start audio (${msg}). Click again. URL: ${resolvedSrc || "(none)"}`;
    syncButtons(false);
    console.warn("Audio play() failed:", err, "URL:", resolvedSrc);
  }
}

function pause(){
  bgm.pause();
  syncButtons(false);
  if (statusEl) statusEl.textContent = "Paused.";
}

/* Wire events */
if (bgm && playBtn && prevBtn && nextBtn && titleEl){
  playBtn.addEventListener('click', ()=>{ if (bgm.paused) tryPlay(); else pause(); });
  if (toggleBtn) toggleBtn.addEventListener('click', ()=>{ if (bgm.paused) tryPlay(); else pause(); });
  prevBtn.addEventListener('click', ()=>{ load(idx-1).then(tryPlay); });
  nextBtn.addEventListener('click', ()=>{ load(idx+1).then(tryPlay); });

  bgm.addEventListener('ended', ()=>{ load(idx+1).then(tryPlay); });
  bgm.addEventListener('error', ()=>{
    const code = bgm.error && bgm.error.code;
    if (statusEl) statusEl.textContent = `Audio error (code ${code || "?"}). URL: ${resolvedSrc || "(none)"}`;
    syncButtons(false);
  });

  bgm.volume = 0.25;
  // Defer initial load until first click to satisfy strict mobile browsers
  const armAndLoad = async ()=>{
    document.removeEventListener('click', armAndLoad, true);
    await load(0);
  };
  document.addEventListener('click', armAndLoad, true);
}else{
  console.warn("Music player elements not found. Check IDs.");
}

/* ---------- Reveal on scroll ---------- */
const reveals = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries)=>{
  for (const e of entries){
    if (e.isIntersecting){
      const delay = parseInt(e.target.dataset.delay || '0', 10);
      setTimeout(()=> e.target.classList.add('show'), delay);
      io.unobserve(e.target);
    }
  }
},{rootMargin:'0px 0px -10% 0px', threshold:0.1});
reveals.forEach(el => io.observe(el));
