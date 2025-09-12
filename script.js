const canvas = document.getElementById('butterfly');
const ctx = canvas.getContext('2d');

function resize(){ canvas.width = innerWidth; canvas.height = innerHeight; }
addEventListener('resize', resize); resize();

const img = new Image();
let ready = false;
img.onload = () => ready = true;
img.src = 'assets/butterfly.png'; // exact filename/case

const flock = [];
function makeButterfly(){
  return {
    x: Math.random()*canvas.width,
    y: canvas.height + 40,
    s: Math.random()*24 + 24,
    vx:(Math.random()-0.5)*0.5,
    vy: -(Math.random()*0.8 + 0.4),
    phase: Math.random()*Math.PI*2
  };
}

function tick(t=0){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  if (Math.random()<0.015 && flock.length<14) flock.push(makeButterfly());
  for (let i=flock.length-1;i>=0;i--){
    const b = flock[i];
    b.x += b.vx + Math.sin(t*0.001 + b.phase)*0.4;
    b.y += b.vy;

    ctx.save();
    ctx.translate(b.x,b.y);
    ctx.rotate(Math.sin(t*0.005 + b.phase)*0.35);
    if (ready) ctx.drawImage(img, -b.s/2, -b.s/2, b.s, b.s);
    else { ctx.fillStyle = 'rgba(255,120,140,.9)'; ctx.fillRect(-b.s/2, -b.s/2, b.s, b.s); }
    ctx.restore();

    if (b.y < -60) flock.splice(i,1);
  }

  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
