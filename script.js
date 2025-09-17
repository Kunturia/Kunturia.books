/* ===== Gold fireflies + robust music + toggles + scroll reveal ===== */

// ---------- Ambient fireflies ----------
const canvas = document.getElementById('ambient');
const ctx = canvas.getContext('2d');

function size() { canvas.width = innerWidth; canvas.height = innerHeight; }
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
    a: Math.random()*0.35 + 0.35,    // base alpha
    tw: Math.random()*0.002 + 0.001, // twinkle speed
    ph: Math.random()*Math.PI*2
  };
}
function drawFly(f, t){
  f.x += f.vx; f.y += f.vy;
  if (f.x < -10) f.x = canvas.width+10; else if (f.x > canvas.width+10) f.x = -10;
  if (f.y < -10) f.y = canvas.height+10; else if (f.y > canvas.height+10) f.y = -10;

  const alpha = f.a * (0.55 + 0.45*Math.sin(t*f.tw + f.ph));
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = 'rgb(212,175,55)';
  ctx.shadowBlur = 12; ctx.shadowColor = 'rgba(212,175,55,.9)';
  ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}
function loop(t=0){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  while (flies.length < MAX_FIREFLIES) flies.push(mkFly());
  for (let i=0;i<flies.length;i++) drawFly(flies[i], t);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// ---------- Year ----------
const y = document.getElementById('year');
if (y) y.textContent = new Date().getFullYear();

// ---------- Prologue & Sample toggles ----------
function makeToggle(btnId, boxId, labels = ['Read','Hide']){
  const btn = document.getElementById(btnId);
  const box = document.getElementById(boxId);
  if (!btn || !box) return;

  const set = (open) => {
    btn.setAttribute('aria-expanded', String(open));
    btn.textContent = open ? `${labels[1]} ${btn.textContent.replace(/^Read |Hide /,'')}` 
                           : `${labels[0]} ${btn.textContent.replace(/^Read |Hide /,'')}`;
  };

  // start closed
  box.hidden = true; set(false);

  btn.addEventListener('click', () => {
    box.hidden = !box.hidden;
    set(!box.hidden);
  });
}

makeToggle('prologueBtn','prologueBox');
makeToggle('sampleBtn','sampleBox');

// ---------- Playlist Music Player ----------
const tracks = [
  { src: "assets/bgm.mp3", title: "Xinzhi’s Theme (OST)" },
  { src: "assets/Da Yu.mp3", title: "Da Yu – Zhou Shen" },
  { src: "assets/Playing Da Yu.mp3", title: "Playing Da Yu – Zhou Shen" },
  { src: "assets/Together forever.mp3", title: "Together Forever – Zhou Shen" }
];

let current = 0;
const bgm = document.getElementById("bgm");
const playBtn = document.getElementById("playPauseBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const titleEl = document.getElementById("track-title");

function loadTrack(i){
  current = (i + tracks.length) % tracks.length;
  bgm.src = tracks[current].src;
  titleEl.textContent = tracks[current].title;
  bgm.play().then(()=> sync()).catch(()=> sync());
}
function sync(){ playBtn.textContent = bgm.paused ? "▶" : "⏸"; }

playBtn.addEventListener("click", () => {
  if (bgm.paused){ bgm.play().then(sync); } else { bgm.pause(); sync(); }
});
prevBtn.addEventListener("click", () => loadTrack(current-1));
nextBtn.addEventListener("click", () => loadTrack(current+1));
bgm.addEventListener("ended", () => loadTrack(current+1));

bgm.volume = 0.25;
loadTrack(0);

}


// ---------- Reveal on scroll ----------
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
