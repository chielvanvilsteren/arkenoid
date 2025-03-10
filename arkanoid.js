const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Responsieve canvas grootte (langwerpiger scherm)
function resizeCanvas() {
  const aspectRatio = 16 / 9; // Langwerpige verhouding
  const maxWidth = window.innerWidth > 800 ? 800 : window.innerWidth - 20;
  const maxHeight = window.innerHeight > 450 ? 450 : window.innerHeight - 20;

  if (maxWidth / maxHeight > aspectRatio) {
    canvas.width = maxHeight * aspectRatio;
    canvas.height = maxHeight;
  } else {
    canvas.width = maxWidth;
    canvas.height = maxWidth / aspectRatio;
  }
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Variabelen voor het spel
const paddleWidth = canvas.width / 6; // Platform breedte relatief aan canvas
const paddleHeight = 15;
const ballRadius = 10;
let paddleX = (canvas.width - paddleWidth) / 2;
let ballX = canvas.width / 2;
let ballY = canvas.height - 30;
let ballSpeedX = 4;
let ballSpeedY = -4;
let isGameOver = false;
let isGameStarted = false;

// Scoresysteem en levelweergave
let score = 0;
let currentLevel = 0;

// Levels en blokjes instellen
const levels = [
  {
    rows: 2,
    cols: 5,
    color: "#FF6F61",
    speedMultiplier: 0.8, // Makkelijker: langzamere bal
    pointsPerBrick: 10,
  },
  {
    rows: 3,
    cols: 6,
    color: "#FFA07A",
    speedMultiplier: 1.0, // Gemiddeld
    pointsPerBrick: 15,
  },
  {
    rows: 4,
    cols: 7,
    color: "#6B5B95",
    speedMultiplier: 1.2, // Normaal
    pointsPerBrick: 20,
  },
  {
    rows: 5,
    cols: 8,
    color: "#88B04B",
    speedMultiplier: 1.4, // Moeilijker
    pointsPerBrick: 25,
  },
  {
    rows: 6,
    cols: 9,
    color: "#FFD700",
    speedMultiplier: 1.6, // Uitdagend
    pointsPerBrick: 30,
  },
];

let bricks = [];
let brickWidth, brickHeight, brickPadding, brickOffsetTop, brickOffsetLeft;

function createBricks(level) {
  const { rows, cols } = levels[level];
  brickWidth = (canvas.width - 20) / cols - 10;
  brickHeight = 20;
  brickPadding = 10;
  brickOffsetTop = 30;
  brickOffsetLeft = (canvas.width - cols * (brickWidth + brickPadding)) / 2;

  bricks = [];
  for (let c = 0; c < cols; c++) {
    bricks[c] = [];
    for (let r = 0; r < rows; r++) {
      bricks[c][r] = { x: 0, y: 0, status: 1 }; // status 1 = zichtbaar, 0 = kapot
    }
  }
}

createBricks(currentLevel);

// Platform tekenen
function drawPaddle() {
  ctx.fillStyle = "#FFD700";
  ctx.fillRect(
    paddleX,
    canvas.height - paddleHeight,
    paddleWidth,
    paddleHeight
  );
}

// Bal tekenen
function drawBall() {
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#FFD700";
  ctx.fill();
  ctx.closePath();
}

// Blokjes tekenen met moderne uitstraling
function drawBricks() {
  for (let c = 0; c < bricks.length; c++) {
    for (let r = 0; r < bricks[c].length; r++) {
      if (bricks[c][r].status === 1) {
        const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;

        // 3D-effect en afronding toevoegen
        const radius = 5; // Radius voor afgeronde hoeken
        const gradient = ctx.createLinearGradient(
          brickX,
          brickY,
          brickX,
          brickY + brickHeight
        );
        gradient.addColorStop(0, lightenColor(levels[currentLevel].color, 0.2)); // Lichtere kleur bovenaan
        gradient.addColorStop(1, levels[currentLevel].color); // Donkere kleur onderaan

        ctx.fillStyle = gradient;
        ctx.strokeStyle = darkenColor(levels[currentLevel].color, 0.2); // Donkere rand voor diepte
        ctx.lineWidth = 2;

        // Afgeronde rechthoek tekenen
        ctx.beginPath();
        ctx.roundRect(brickX, brickY, brickWidth, brickHeight, [radius]);
        ctx.fill();
        ctx.stroke();

        // Schaduw voor extra 3D-effect
        ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
      }
    }
  }

  // Reset schaduwinstellingen
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}

// Hulpfuncties voor kleuren manipulatie
function lightenColor(color, amount) {
  const col = parseInt(color.slice(1), 16);
  const r = Math.min(255, ((col >> 16) & 0xff) + amount * 255);
  const g = Math.min(255, ((col >> 8) & 0xff) + amount * 255);
  const b = Math.min(255, (col & 0xff) + amount * 255);
  return `#${Math.round(r).toString(16).padStart(2, "0")}${Math.round(g)
    .toString(16)
    .padStart(2, "0")}${Math.round(b).toString(16).padStart(2, "0")}`;
}

function darkenColor(color, amount) {
  const col = parseInt(color.slice(1), 16);
  const r = Math.max(0, ((col >> 16) & 0xff) - amount * 255);
  const g = Math.max(0, ((col >> 8) & 0xff) - amount * 255);
  const b = Math.max(0, (col & 0xff) - amount * 255);
  return `#${Math.round(r).toString(16).padStart(2, "0")}${Math.round(g)
    .toString(16)
    .padStart(2, "0")}${Math.round(b).toString(16).padStart(2, "0")}`;
}

// Beweging van de bal
function moveBall() {
  ballX += ballSpeedX * levels[currentLevel].speedMultiplier;
  ballY += ballSpeedY * levels[currentLevel].speedMultiplier;

  // Botsing met linker- en rechterrand
  if (ballX + ballRadius > canvas.width || ballX - ballRadius < 0) {
    ballSpeedX = -ballSpeedX;
  }

  // Botsing met bovenrand
  if (ballY - ballRadius < 0) {
    ballSpeedY = -ballSpeedY;
  }

  // Game over als de bal de onderkant raakt
  if (ballY + ballRadius > canvas.height) {
    isGameOver = true;
  }

  // Botsing met platform
  if (
    ballY + ballRadius > canvas.height - paddleHeight &&
    ballX > paddleX &&
    ballX < paddleX + paddleWidth
  ) {
    ballSpeedY = -ballSpeedY;
  }
}

// Botsing detectie met blokjes
function collisionDetection() {
  for (let c = 0; c < bricks.length; c++) {
    for (let r = 0; r < bricks[c].length; r++) {
      const brick = bricks[c][r];
      if (brick.status === 1) {
        if (
          ballX > brick.x &&
          ballX < brick.x + brickWidth &&
          ballY > brick.y &&
          ballY < brick.y + brickHeight
        ) {
          ballSpeedY = -ballSpeedY;
          brick.status = 0;

          // Score verhogen
          score += levels[currentLevel].pointsPerBrick;

          // Controleer of alle blokjes zijn vernietigd
          if (isLevelComplete()) {
            nextLevel();
          }
        }
      }
    }
  }
}

// Controleer of alle blokjes zijn vernietigd
function isLevelComplete() {
  for (let c = 0; c < bricks.length; c++) {
    for (let r = 0; r < bricks[c].length; r++) {
      if (bricks[c][r].status === 1) {
        return false;
      }
    }
  }
  return true;
}

// Ga naar het volgende level
function nextLevel() {
  currentLevel++;
  if (currentLevel >= levels.length) {
    showGameOverModal("Gefeliciteerd! Je hebt alle levels voltooid!");
    return;
  }
  createBricks(currentLevel);
  resetBallAndPaddle();
}

// Reset bal en platform voor een nieuw level
function resetBallAndPaddle() {
  ballX = canvas.width / 2;
  ballY = canvas.height - 30;
  ballSpeedX = 4;
  ballSpeedY = -4;
  paddleX = (canvas.width - paddleWidth) / 2;
}

// Keyboard input afhandelen
let rightPressed = false;
let leftPressed = false;

document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

function keyDownHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = true;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = true;
  }
}

function keyUpHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = false;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = false;
  }
}

// Touch input afhandelen
document.addEventListener("touchstart", touchStartHandler);
document.addEventListener("touchmove", touchMoveHandler);

function touchStartHandler(e) {
  const touchX = e.touches[0].clientX;
  paddleX = touchX - paddleWidth / 2;
}

function touchMoveHandler(e) {
  const touchX = e.touches[0].clientX;
  paddleX = touchX - paddleWidth / 2;

  // Zorg ervoor dat het platform niet buiten het scherm komt
  if (paddleX < 0) paddleX = 0;
  if (paddleX + paddleWidth > canvas.width)
    paddleX = canvas.width - paddleWidth;
}

// Modals
function showModal(message, buttonText, callback) {
  const modal = document.createElement("div");
  modal.style.position = "fixed";
  modal.style.top = "0";
  modal.style.left = "0";
  modal.style.width = "100%";
  modal.style.height = "100%";
  modal.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
  modal.style.color = "#fff";
  modal.style.display = "flex";
  modal.style.justifyContent = "center";
  modal.style.alignItems = "center";
  modal.style.zIndex = "1000";
  modal.innerHTML = `
        <div style="text-align: center; background: rgba(0, 0, 0, 0.9); padding: 20px; border-radius: 10px;">
            <h2>${message}</h2>
            <button id="modalButton" style="padding: 10px 20px; background: #FFD700; border: none; border-radius: 5px; cursor: pointer;">${buttonText}</button>
        </div>
    `;
  document.body.appendChild(modal);

  document.getElementById("modalButton").addEventListener("click", () => {
    modal.remove();
    if (callback) callback();
  });
}

function showStartModal() {
  showModal(
    'Welkom bij Arkanoid!<br>Klik op "Start" om te beginnen.',
    "Start",
    () => {
      isGameStarted = true;
    }
  );
}

function showGameOverModal(message) {
  showModal(message, "Opnieuw Spelen", () => {
    document.location.reload();
  });
}

// Tekst weergeven (score en level)
function drawScoreAndLevel() {
  ctx.fillStyle = "#fff";
  ctx.font = "16px Arial";
  ctx.fillText(`Score: ${score}`, 10, 20);
  ctx.fillText(`Level: ${currentLevel + 1}`, canvas.width - 100, 20);
}

// Spel lus
function update() {
  if (!isGameStarted) {
    requestAnimationFrame(update);
    return;
  }

  if (isGameOver) {
    showGameOverModal("Game Over!");
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBricks();
  drawBall();
  drawPaddle();
  drawScoreAndLevel();
  moveBall();
  collisionDetection();

  // Platform bewegen (sneller)
  if (rightPressed && paddleX < canvas.width - paddleWidth) {
    paddleX += 10;
  } else if (leftPressed && paddleX > 0) {
    paddleX -= 10;
  }

  requestAnimationFrame(update);
}

// Start het spel met een modal
showStartModal();
update();
