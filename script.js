// Get references to all elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const fishImage = new Image();
fishImage.src = 'https://assets.codepen.io/12192911/FISH.png'; // Replace this with your fish image

const gameOverContainer = document.getElementById('game-over-container');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const leaderboardList = document.getElementById('leaderboard-list');

let fish = {
    x: canvas.width / 4,
    y: canvas.height / 2,
    width: 100,
    height: 88,
    speed: 5,
    dy: 0
};

let backgroundX = 0;
const backgroundSpeed = 2;

let obstacles = [];
let coins = [];
let frame = 0;
let isGameOver = false;
let score = 0;
let coinsCollected = 0;
let leaderboard = [];
let gameStarted = false;
let isUpPressed = false;
let isDownPressed = false;

// Bubble sound
const bubbleSound = new Audio('https://assets.codepen.io/12192911/104950__glaneur-de-sons__bubbles-2.wav');

// Event listeners for controls
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp') isUpPressed = true;
    if (event.key === 'ArrowDown') isDownPressed = true;
});
document.addEventListener('keyup', (event) => {
    if (event.key === 'ArrowUp') isUpPressed = false;
    if (event.key === 'ArrowDown') isDownPressed = false;
});

// Function to move the fish
function moveFish() {
    if (isUpPressed) fish.dy = -fish.speed;
    else if (isDownPressed) fish.dy = fish.speed;
    else fish.dy = 0;

    fish.y += fish.dy;
    if (fish.y < 0) fish.y = 0;
    if (fish.y + fish.height > canvas.height) fish.y = canvas.height - fish.height;
}

// Draw fish
function drawFish() {
    ctx.drawImage(fishImage, fish.x, fish.y, fish.width, fish.height);
}

// Generate obstacles and coins
function generateObstaclesAndCoins() {
    if (frame % 100 === 0) {
        const obstacleHeight = Math.random() * (canvas.height / 3) + 50;
        const gap = 200;
        const obstacleY = Math.random() * (canvas.height - obstacleHeight - gap);

        obstacles.push({ x: canvas.width, y: obstacleY, width: 50, height: obstacleHeight, passed: false });
        coins.push({ x: canvas.width + 250, y: obstacleY + obstacleHeight + (gap / 2) - 15, width: 30, height: 30, collected: false });
    }
}

// Move obstacles and coins
function moveObstaclesAndCoins() {
    obstacles.forEach(obstacle => obstacle.x -= 5);
    coins.forEach(coin => coin.x -= 5);

    obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);
    coins = coins.filter(coin => coin.x + coin.width > 0 && !coin.collected);
}

// Draw obstacles and coins
function drawObstaclesAndCoins() {
    ctx.fillStyle = 'green';
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, 0, obstacle.width, obstacle.y);
        ctx.fillRect(obstacle.x, obstacle.y + 200, obstacle.width, canvas.height - (obstacle.y + 200));
    });

    ctx.fillStyle = 'gold';
    coins.forEach(coin => {
        ctx.beginPath();
        ctx.arc(coin.x + coin.width / 2, coin.y + coin.height / 2, coin.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    });
}

// Move the background
function moveBackground() {
    backgroundX -= backgroundSpeed;
    
    // Reset the background when it scrolls off screen
    if (backgroundX <= -canvas.width) {
        backgroundX = 0;
    }

    // Apply the background position update to the canvas style
    canvas.style.backgroundPosition = `${backgroundX}px 0`;
}

// Check for collisions
function checkCollisions() {
    obstacles.forEach(obstacle => {
        if (fish.x < obstacle.x + obstacle.width &&
            fish.x + fish.width > obstacle.x &&
            (fish.y < obstacle.y || fish.y + fish.height > obstacle.y + 200)) {
            endGame();
        }
    });

    coins.forEach(coin => {
        if (fish.x < coin.x + coin.width &&
            fish.x + fish.width > coin.x &&
            fish.y < coin.y + coin.height &&
            fish.y + fish.height > coin.y) {
            coin.collected = true;
            coinsCollected += 1;
            bubbleSound.play();
        }
    });
}

// Update the score
function updateScore() {
    obstacles.forEach(obstacle => {
        if (!obstacle.passed && obstacle.x + obstacle.width < fish.x) {
            score += 1;
            obstacle.passed = true;
        }
    });

    ctx.font = '30px "Galindo", sans-serif';
    ctx.fillStyle = 'black';
    ctx.fillText(`Score: ${score}`, 20, 50);
    ctx.fillText(`Coins: ${coinsCollected}`, 20, 80);
}

// End the game
function endGame() {
    isGameOver = true;
    updateLeaderboard();
    gameOverContainer.style.display = 'flex';
    startButton.style.display = 'none';
}

// Update leaderboard
function updateLeaderboard() {
    leaderboard.push(score);
    leaderboard.sort((a, b) => b - a);
    leaderboard = leaderboard.slice(0, 3);

    leaderboardList.innerHTML = '';
    leaderboard.forEach(score => {
        const listItem = document.createElement('li');
        listItem.innerText = score;
        leaderboardList.appendChild(listItem);
    });
}

// Restart the game
restartButton.addEventListener('click', () => {
    isGameOver = false;
    score = 0;
    coinsCollected = 0;
    frame = 0;
    fish.y = canvas.height / 2;
    fish.dy = 0;
    obstacles = [];
    coins = [];
    gameOverContainer.style.display = 'none';
    gameLoop();
});

// Start the game
startButton.addEventListener('click', () => {
    gameStarted = true;
    isGameOver = false;
    frame = 0;
    score = 0;
    coinsCollected = 0;
    obstacles = [];
    coins = [];
    startButton.style.display = 'none';  
    document.getElementById('start-screen-image').style.display = 'none';
    gameOverContainer.style.display = 'none';
    fish.y = canvas.height / 2;
    fish.dy = 0;
    gameLoop();
});

// Main game loop
function gameLoop() {
    if (!gameStarted || isGameOver) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    moveBackground();
    moveFish();
    drawFish();
    generateObstaclesAndCoins();
    moveObstaclesAndCoins();
    drawObstaclesAndCoins();
    checkCollisions();
    updateScore();

    frame++;
    requestAnimationFrame(gameLoop);
}

// Initialize the game
gameOverContainer.style.display = 'none';
startButton.style.display = 'block';
