const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Canvas grootte aanpassen aan het scherm
canvas.width = window.innerWidth > 600 ? 600 : window.innerWidth - 20;
canvas.height = window.innerHeight > 400 ? 400 : window.innerHeight - 20;

// Variabelen voor het spel
const paddleWidth = 100;
const paddleHeight = 15;
const ballRadius = 10;
let paddleX = (canvas.width - paddleWidth) / 2;
let ballX = canvas.width / 2;
let ballY = canvas.height - 30;
let ballSpeedX = 4;
let ballSpeedY = -4;
let isGameOver = false;

// Add these constants at the top with your other constants
let currentLevel = 1;
const maxLevels = 3;

// Add this levels configuration
const levelConfigs = [
  // Level 1
  {
    rows: 3,
    columns: 6,
    color: "#0095DD",
    brickPattern: [
      [1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1],
    ],
  },
  // Level 2
  {
    rows: 4,
    columns: 7,
    color: "#DD9500",
    brickPattern: [
      [1, 1, 1, 0, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 0, 1, 1, 1],
    ],
  },
  // Level 3
  {
    rows: 5,
    columns: 8,
    color: "#DD0095",
    brickPattern: [
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 1, 1, 1, 1, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 1, 1, 1, 1, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
    ],
  },
];

// Touch en keyboard input
let rightPressed = false;
let leftPressed = false;

// Blokjes instellen
const brickRowCount = 5;
const brickColumnCount = 8;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 35;

const bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
  bricks[c] = [];
  for (let r = 0; r < brickRowCount; r++) {
    bricks[c][r] = { x: 0, y: 0, status: 1 }; // status 1 = zichtbaar, 0 = kapot
  }
}

// Platform tekenen
function drawPaddle() {
  ctx.fillStyle = "#0095DD";
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
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

// Modify your drawBricks function
function drawBricks() {
  const level = levelConfigs[currentLevel - 1];
  for (let c = 0; c < level.columns; c++) {
    for (let r = 0; r < level.rows; r++) {
      if (bricks[c][r].status === 1) {
        const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;
        ctx.fillStyle = level.color;
        ctx.fillRect(brickX, brickY, brickWidth, brickHeight);
      }
    }
  }
}

// Beweging van de bal
function moveBall() {
  ballX += ballSpeedX;
  ballY += ballSpeedY;

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

// Add this function to check if level is completed
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

// Modify your collisionDetection function to include level progression
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

          if (isLevelComplete()) {
            if (currentLevel < maxLevels) {
              currentLevel++;
              bricks.length = 0;
              Object.assign(bricks, initializeBricks());
              ballX = canvas.width / 2;
              ballY = canvas.height - 30;
              paddleX = (canvas.width - paddleWidth) / 2;
            } else {
              alert("Congratulations! You've completed all levels!");
              document.location.reload();
            }
          }
        }
      }
    }
  }
}

// Keyboard input afhandelen
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

// Spel lus
function update() {
  if (isGameOver) {
    alert("Game Over!");
    document.location.reload();
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBricks();
  drawBall();
  drawPaddle();
  moveBall();
  collisionDetection();

  // Platform bewegen
  if (rightPressed && paddleX < canvas.width - paddleWidth) {
    paddleX += 7;
  } else if (leftPressed && paddleX > 0) {
    paddleX -= 7;
  }

  requestAnimationFrame(update);
}

// Modify the initializeBricks function
function initializeBricks() {
  const level = levelConfigs[currentLevel - 1];
  const bricks = [];

  for (let c = 0; c < level.columns; c++) {
    bricks[c] = [];
    for (let r = 0; r < level.rows; r++) {
      bricks[c][r] = {
        x: 0,
        y: 0,
        status: level.brickPattern[r][c],
      };
    }
  }
  return bricks;
}

// Initialize bricks at the start of the game
Object.assign(bricks, initializeBricks());

update();
