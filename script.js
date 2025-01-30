const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const box = 20;
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
canvas.width = isMobile ? 300 : 600;
canvas.height = isMobile ? 300 : 600;

let snake = [];
snake[0] = { x: 9 * box, y: 10 * box };

let food = getRandomFoodPosition();
let foodColor = getRandomColor();

let score = 0;
let highScore = getHighScore();
let d;
let isChangingColors = false;
let directionQueue = [];
let gameSpeed = 150;
let game;

let colors = getRandomColors();
let bgColor = getRandomColor();

document.addEventListener('keydown', direction);
document.getElementById('resetButton').addEventListener('click', resetGame);
document
  .getElementById('darkModeToggle')
  .addEventListener('click', toggleDarkMode);
document
  .getElementById('difficultyToggle')
  .addEventListener('click', toggleDifficulty);

if (isMobile) {
  document.getElementById('controls').style.display = 'flex';
  document
    .getElementById('upButton')
    .addEventListener('touchstart', () => direction({ keyCode: 38 }));
  document
    .getElementById('downButton')
    .addEventListener('touchstart', () => direction({ keyCode: 40 }));
  document
    .getElementById('leftButton')
    .addEventListener('touchstart', () => direction({ keyCode: 37 }));
  document
    .getElementById('rightButton')
    .addEventListener('touchstart', () => direction({ keyCode: 39 }));
}

function direction(event) {
  const newDirection = event.keyCode;
  const lastDirection = directionQueue.length
    ? directionQueue[directionQueue.length - 1]
    : d;

  if (
    newDirection == 37 &&
    lastDirection != 'RIGHT' &&
    lastDirection != 'LEFT'
  ) {
    directionQueue.push('LEFT');
  } else if (
    newDirection == 38 &&
    lastDirection != 'DOWN' &&
    lastDirection != 'UP'
  ) {
    directionQueue.push('UP');
  } else if (
    newDirection == 39 &&
    lastDirection != 'LEFT' &&
    lastDirection != 'RIGHT'
  ) {
    directionQueue.push('RIGHT');
  } else if (
    newDirection == 40 &&
    lastDirection != 'UP' &&
    lastDirection != 'DOWN'
  ) {
    directionQueue.push('DOWN');
  }
}

function resetGame() {
  snake = [{ x: 9 * box, y: 10 * box }];
  score = 0;
  d = null;
  directionQueue = [];
  clearInterval(game);
  game = setInterval(draw, gameSpeed);
}

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
}

function toggleDifficulty() {
  gameSpeed = gameSpeed === 150 ? 100 : 150;
  clearInterval(game);
  game = setInterval(draw, gameSpeed);
  document.getElementById('difficultyToggle').innerText =
    gameSpeed === 150 ? 'Increase Difficulty' : 'Decrease Difficulty';
}

function collision(newHead, snake) {
  for (let i = 0; i < snake.length; i++) {
    if (newHead.x == snake[i].x && newHead.y == snake[i].y) {
      return true;
    }
  }
  return false;
}

function getRandomColor() {
  return `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(
    Math.random() * 256
  )}, ${Math.floor(Math.random() * 256)})`;
}

function getRandomColors() {
  let colors = [];
  for (let i = 0; i < 6; i++) {
    colors.push(getRandomColor());
  }
  return colors;
}

function getRandomFoodPosition() {
  let position;
  do {
    position = {
      x: Math.floor(Math.random() * (canvas.width / box - 1) + 1) * box,
      y: Math.floor(Math.random() * (canvas.height / box - 1) + 1) * box,
    };
  } while (collision(position, snake));
  return position;
}

function getHighScore() {
  return localStorage.getItem('highScore') || 0;
}

function setHighScore(score) {
  localStorage.setItem('highScore', score);
}

function changeColorsRapidly() {
  if (isChangingColors) return;
  isChangingColors = true;
  let interval = setInterval(() => {
    bgColor = getRandomColor();
    colors[0] = getRandomColor();
    foodColor = getRandomColor();
  }, 120); // 25 times in 3 seconds (3000ms / 25 = 120ms)
  setTimeout(() => {
    clearInterval(interval);
    isChangingColors = false;
  }, 3000);
}

function draw() {
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = i == 0 ? colors[0] : 'white';
    ctx.strokeStyle = 'red';
    ctx.fillRect(snake[i].x, snake[i].y, box, box);
    ctx.strokeRect(snake[i].x, snake[i].y, box, box);
  }

  // Draw eyes on the head of the snake
  if (snake.length > 0) {
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(
      snake[0].x + box / 4,
      snake[0].y + box / 4,
      box / 10,
      0,
      Math.PI * 2
    );
    ctx.arc(
      snake[0].x + (3 * box) / 4,
      snake[0].y + box / 4,
      box / 10,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  ctx.fillStyle = foodColor;
  ctx.fillRect(food.x, food.y, box, box);

  let snakeX = snake[0].x;
  let snakeY = snake[0].y;

  if (directionQueue.length) {
    d = directionQueue.shift();
  }

  if (d == 'LEFT') snakeX -= box;
  if (d == 'UP') snakeY -= box;
  if (d == 'RIGHT') snakeX += box;
  if (d == 'DOWN') snakeY += box;

  if (snakeX == food.x && snakeY == food.y) {
    score++;
    if (score > highScore) {
      highScore = score;
      setHighScore(highScore);
      changeColorsRapidly();
    }
    food = getRandomFoodPosition();
    do {
      foodColor = getRandomColor();
    } while (foodColor === bgColor);
    colors.push(colors.shift());
    do {
      bgColor = getRandomColor();
    } while (bgColor === foodColor);
  } else {
    snake.pop();
  }

  let newHead = {
    x: snakeX,
    y: snakeY,
  };

  if (
    snakeX < 0 ||
    snakeY < 0 ||
    snakeX >= canvas.width ||
    snakeY >= canvas.height ||
    collision(newHead, snake)
  ) {
    clearInterval(game);
  }

  snake.unshift(newHead);

  document.getElementById(
    'score'
  ).innerText = `Score: ${score} | High Score: ${highScore}`;
}

function showEpilepsyWarning() {
  const warning = document.getElementById('epilepsyWarning');
  if (!localStorage.getItem('epilepsyWarningShown')) {
    warning.style.display = 'block';
    document.getElementById('acceptWarning').addEventListener('click', () => {
      warning.style.display = 'none';
      localStorage.setItem('epilepsyWarningShown', 'true');
    });
  }
}

showEpilepsyWarning();

game = setInterval(draw, gameSpeed);
