// Sakura petal animation on canvas (lightweight)
const canvas = document.getElementById('sakura');
const ctx = canvas.getContext('2d');
let W, H, petals;

function resize(){
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
  petals = petals || [];
}
window.addEventListener('resize', resize);
resize();

function makePetal(){
  // Each petal is a bezier-ish rotated ellipse
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
    alpha: Math.random()*0.3 + 0.5
  };
}

function drawPetal(p){
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot);
  const s = p.size;
  // soft rose color with subtle gradient
  const grd = ctx.createRadialGradient(0,0,1, 0,0,s);
  grd.addColorStop(0, `rgba(255, 184, 200, ${p.alpha})`);
  grd.addColorStop(1, `rgba(255, 140, 170, ${p.alpha*0.85})`);
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.moveTo(0, -s*0.6);
  ctx.bezierCurveTo(s, -s, s, s, 0, s*0.8);
  ctx.bezierCurveTo(-s, s, -s, -s, 0, -s*0.6);
  ctx.fill();
  ctx.restore();
}

let lastSpawn = 0;
function tick(t){
  ctx.clearRect(0,0,W,H);

  // spawn
  if(t - lastSpawn > 40 && (petals?.length||0) < 120){
    petals.push(makePetal());
    lastSpawn = t;
  }

  // update & draw
  for(let i=petals.length-1;i>=0;i--){
    const p = petals[i];
    p.x += p.vx + Math.sin(t*0.001 + i)*p.sway*0.2;
    p.y += p.vy;
    p.rot += p.vr;
    drawPetal(p);
    if(p.y > H + 40) petals.splice(i,1);
  }

  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

// Subscribe stub
function subscribe(e){
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  if(!email) return;
  alert('Subscribed: ' + email + '\nReplace this with your real email service later.');
  e.target.reset();
}

// Year
document.getElementById('year').textContent = new Date().getFullYear();
