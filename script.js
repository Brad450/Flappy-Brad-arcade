const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const restartBtn = document.getElementById('restart');

const state = {
  player: { x: canvas.width / 2, y: canvas.height - 70, w: 48, h: 24, speed: 6 },
  left: false,
  right: false,
  score: 0,
  best: Number(localStorage.getItem('neon_dodge_best') || 0),
  over: false,
  tick: 0,
  spawnEvery: 40,
  hazards: []
};
bestEl.textContent = state.best;

function spawnHazard() {
  const size = 16 + Math.random() * 26;
  state.hazards.push({
    x: Math.random() * (canvas.width - size),
    y: -size,
    s: size,
    vy: 2 + Math.random() * 3 + state.score / 800
  });
}

function collide(a, b) {
  return a.x < b.x + b.s && a.x + a.w > b.x && a.y < b.y + b.s && a.y + a.h > b.y;
}

function drawPlayer() {
  const p = state.player;
  ctx.fillStyle = '#be2edd';
  ctx.fillRect(p.x, p.y, p.w, p.h);
  ctx.fillStyle = '#f9ca24';
  ctx.fillRect(p.x + 5, p.y + 4, p.w - 10, p.h - 8);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 70; i++) {
    ctx.fillStyle = `rgba(126, 214, 223, ${Math.random() * 0.4})`;
    ctx.fillRect((i * 37 + state.tick * 0.5) % canvas.width, (i * 83) % canvas.height, 2, 2);
  }

  drawPlayer();

  ctx.fillStyle = '#ff7979';
  state.hazards.forEach((h) => ctx.fillRect(h.x, h.y, h.s, h.s));

  if (state.over) {
    ctx.fillStyle = 'rgba(0,0,0,.55)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 10);
    ctx.font = '20px sans-serif';
    ctx.fillText('Press Restart', canvas.width / 2, canvas.height / 2 + 26);
  }
}

function update() {
  if (state.over) return;

  state.tick++;
  if (state.left) state.player.x -= state.player.speed;
  if (state.right) state.player.x += state.player.speed;
  state.player.x = Math.max(0, Math.min(canvas.width - state.player.w, state.player.x));

  if (state.tick % state.spawnEvery === 0) {
    spawnHazard();
    if (state.spawnEvery > 18) state.spawnEvery -= 0.3;
  }

  state.hazards.forEach((h) => {
    h.y += h.vy;
    if (collide(state.player, h)) state.over = true;
  });

  state.hazards = state.hazards.filter((h) => h.y < canvas.height + h.s);

  state.score += 1;
  scoreEl.textContent = state.score;

  if (state.score > state.best) {
    state.best = state.score;
    localStorage.setItem('neon_dodge_best', state.best);
    bestEl.textContent = state.best;
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

window.addEventListener('keydown', (e) => {
  if (['ArrowLeft', 'a', 'A'].includes(e.key)) state.left = true;
  if (['ArrowRight', 'd', 'D'].includes(e.key)) state.right = true;
});
window.addEventListener('keyup', (e) => {
  if (['ArrowLeft', 'a', 'A'].includes(e.key)) state.left = false;
  if (['ArrowRight', 'd', 'D'].includes(e.key)) state.right = false;
});

restartBtn.addEventListener('click', () => {
  state.player.x = canvas.width / 2;
  state.score = 0;
  state.over = false;
  state.hazards = [];
  state.spawnEvery = 40;
  state.tick = 0;
  scoreEl.textContent = '0';
});

loop();
