const canvas = document.getElementById('butterfly');
const ctx = canvas.getContext('2d');

function resize(){ canvas.width = innerWidth; canvas.height = innerHeight; }
addEventListener('resize', resize); resize();

let boxes = [];
function makeBox(){
  return { x: Math.random()*canvas.width,
           y: canvas.height + 20,
           s: Math.random()*30 + 20,
           vx:(Math.random()-0.5)*0.5,
           vy: -(Math.random()*0.8 + 0.4) };
}

function tick(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  if (Math.random()<0.02 && boxes.length<15) boxes.push(makeBox());
  for (let i=boxes.length-1;i>=0;i--){
     const b = boxes[i];
     ctx.fillStyle = 'red';
     ctx.fillRect(b.x, b.y, b.s, b.s);
     b.x += b.vx; b.y += b.vy;
     if (b.y < -40) boxes.splice(i,1);
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
