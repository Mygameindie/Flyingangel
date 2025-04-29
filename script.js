const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Load base images
const baseImage = new Image();
baseImage.src = 'base.png';

const baseImagesFlying = [
  new Image(),
  new Image()
];
baseImagesFlying[0].src = 'base2.png';
baseImagesFlying[1].src = 'base3.png';

const baseFallingImage = new Image();
baseFallingImage.src = 'base4.png'; // ตอนตกจะใช้รูปนี้

// Flying animation control
let flyingFrame = 0;
let flyingTimer = 0;
const flyingSpeed = 10;

// Ground settings
const groundHeight = 100;
let groundY = canvas.height - groundHeight;

let base = {
  x: canvas.width / 2,
  y: groundY - 250,
  width: 180,
  height: 250,
  oldx: canvas.width / 2,
  oldy: groundY - 250,
  isDragging: false
};

const gravity = 1.2;
const damping = 0.985;

let vy = 0; // global velocity y

function getPointerPos(e) {
  const rect = canvas.getBoundingClientRect();
  if (e.touches) {
    return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
  } else {
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }
}

canvas.addEventListener('mousedown', handleStart);
canvas.addEventListener('touchstart', handleStart);
canvas.addEventListener('mousemove', handleMove);
canvas.addEventListener('touchmove', handleMove);
canvas.addEventListener('mouseup', handleEnd);
canvas.addEventListener('touchend', handleEnd);

function handleStart(e) {
  const pos = getPointerPos(e);
  if (
    pos.x >= base.x - base.width / 2 &&
    pos.x <= base.x + base.width / 2 &&
    pos.y >= base.y - base.height / 2 &&
    pos.y <= base.y + base.height / 2
  ) {
    base.isDragging = true;
    e.preventDefault();
  }
}

function handleMove(e) {
  if (!base.isDragging) return;
  const pos = getPointerPos(e);
  base.x = pos.x;
  base.y = pos.y;
  if (e.touches) e.preventDefault();
}

function handleEnd() {
  if (base.isDragging) {
    base.oldx = base.x;
    base.oldy = base.y;
  }
  base.isDragging = false;
}

function updateBase() {
  let vx = (base.x - base.oldx) * damping;
  vy = (base.y - base.oldy) * damping; // assign global vy

  base.oldx = base.x;
  base.oldy = base.y;
  base.x += vx;
  base.y += vy + gravity;

  // Bounce on ground
  if (base.y + base.height / 2 > groundY) {
    base.y = groundY - base.height / 2;
    base.oldy = base.y + vy * -0.2;
    vy = 0;
  }
  // Stay inside the screen horizontally
  if (base.x - base.width / 2 < 0) {
    base.x = base.width / 2;
    base.oldx = base.x + vx * -0.2;
  }
  if (base.x + base.width / 2 > canvas.width) {
    base.x = canvas.width - base.width / 2;
    base.oldx = base.x + vx * -0.2;
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw ground
  ctx.fillStyle = '#5c4033';
  ctx.fillRect(0, groundY, canvas.width, groundHeight);

  if (base.y + base.height / 2 < groundY) {
    if (vy > 5) {
      // ถ้าตกเร็วมาก (vy > 5) ใช้ base4
      ctx.drawImage(baseFallingImage, base.x - base.width / 2, base.y - base.height / 2, base.width, base.height);
    } else {
      // ลอยกลางอากาศแบบปกติ วน base2, base3
      flyingTimer++;
      if (flyingTimer > flyingSpeed) {
        flyingTimer = 0;
        flyingFrame = (flyingFrame + 1) % baseImagesFlying.length;
      }
      ctx.drawImage(baseImagesFlying[flyingFrame], base.x - base.width / 2, base.y - base.height / 2, base.width, base.height);
    }
  } else {
    // ติดพื้น
    flyingFrame = 0;
    flyingTimer = 0;
    ctx.drawImage(baseImage, base.x - base.width / 2, base.y - base.height / 2, base.width, base.height);
  }
}

function animate() {
  if (!base.isDragging) {
    updateBase();
  }
  draw();
  requestAnimationFrame(animate);
}

animate();

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  groundY = canvas.height - groundHeight;

  if (base.y + base.height / 2 > groundY) {
    base.y = groundY - base.height / 2;
    base.oldy = base.y;
  }
});