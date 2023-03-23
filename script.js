const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const paddleHeight = 100;
const paddleWidth = 12;
const ballSize = 12;
const ballSpeed = 4;
const maxScore = 5;

let player1Score = 0;
let player2Score = 0;

const player1 = {
    x: 0,
    y: (canvas.height - paddleHeight) / 2
};

const player2 = {
    x: canvas.width - paddleWidth,
    y: (canvas.height - paddleHeight) / 2
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: ballSpeed,
    dy: Math.random() * 2.0 - 1.0
};

function drawPaddle(x, y) {
    ctx.fillStyle = 'white';
    ctx.fillRect(x, y, paddleWidth, paddleHeight);
}

function drawBall(x, y) {
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(x + ballSize / 2, y + ballSize / 2, ballSize / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
}

function drawField() {
    ctx.strokeStyle = 'white';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 50, 0, Math.PI * 2);
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();

    ctx.fillStyle = 'white';
    ctx.fillRect(canvas.width / 2 - 1, 0, 2, canvas.height);
}

function resetBall() {
    ball.x = canvas.width / 2 - ballSize / 2;
    ball.y = canvas.height / 2 - ballSize / 2;
    let winner = 1;
    if (ball.dx != 0) {
        winner = ball.dx / Math.abs(ball.dx);
    }
    ball.dx = 0;
    ball.dy = 0;
    setTimeout(() => {
        ball.dx = winner * ballSpeed;
        ball.dy = Math.random() * 2 - 1;
    }, 500);
}

let gamePaused = false;

function togglePlayPause() {
    gamePaused = !gamePaused;
    const pauseIcon = document.getElementById('pauseIcon');
    const playIcon = document.getElementById('playIcon');
    if (gamePaused) {
        pauseIcon.style.display = 'none';
        playIcon.style.display = 'inline';
    } else {
        pauseIcon.style.display = 'inline';
        playIcon.style.display = 'none';
    }
}


const maxBallSpeed = 10;

function lineIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
    const uA = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
    const uB = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));

    return uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1;
}

function checkCollision(prevX, prevY, ball, paddle, p1) {
    const paddleTopLeft = { x: paddle.x - paddleWidth * p1, y: paddle.y };
    const paddleBottomLeft = { x: paddle.x - paddleWidth * p1, y: paddle.y + paddleHeight };

    return lineIntersect(prevX, prevY, ball.x, ball.y, paddleTopLeft.x, paddleTopLeft.y, paddleBottomLeft.x, paddleBottomLeft.y);
}

function moveBall() {
    const prevX = ball.x;
    const prevY = ball.y;
    if (!gamePaused) {
        ball.x += ball.dx;
        ball.y += ball.dy;
    }
    if (ball.y <= 0 || ball.y + ballSize >= canvas.height) {
        ball.dy *= -1;
    }
    if (checkCollision(prevX, prevY, ball, player1, p1 = -1.0)) {
        const paddleCenter = player1.y + paddleHeight / 2;
        const relativeBallPos = (ball.y + ballSize / 2 - paddleCenter) / (paddleHeight / 2);
        const speedIncrease = Math.abs(1 - relativeBallPos);
        ball.dx = Math.min(maxBallSpeed, Math.abs(ball.dx)) * (1 + speedIncrease * 0.1);
        if (keysPressed['w'] || keysPressed['s']) {
            ball.dx *= 1.1;
        }
        ball.dy += (ball.y - (player1.y + paddleHeight / 2)) * 0.02;
    } else if (checkCollision(prevX, prevY, ball, player2, p1 = 1.0)) {
        const paddleCenter = player2.y + paddleHeight / 2;
        const relativeBallPos = (ball.y + ballSize / 2 - paddleCenter) / (paddleHeight / 2);
        const speedIncrease = Math.abs(1 - relativeBallPos);
        ball.dx = -Math.min(maxBallSpeed, Math.abs(ball.dx)) * (1 + speedIncrease * 0.1);
        if (keysPressed['ArrowUp'] || keysPressed['ArrowDown']) {
            ball.dx *= 1.1;
        }
        ball.dy += (ball.y - (player2.y + paddleHeight / 2)) * 0.02;
    } else if (ball.x < 0 && player2Score < maxScore) {
        player2Score++;
        if (player2Score < maxScore)
            resetBall();
    } else if (ball.x > canvas.width - ballSize && player1Score < maxScore) {
        player1Score++;
        if (player1Score < maxScore)
            resetBall();
    }
}


function drawScore() {
    ctx.font = '48px monospace';
    ctx.fillStyle = 'white';
    ctx.fillText(player1Score, (canvas.width / 4), 50);
    ctx.fillText(player2Score, (3 * canvas.width / 4), 50);
}

let keysPressed = {};

document.addEventListener('keydown', (e) => {
    keysPressed[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    delete keysPressed[e.key];
});

function movePaddles() {
    const paddleSpeed = 10;

    if (keysPressed['w'] && player1.y > 0) {
        player1.y -= paddleSpeed;
    } else if (keysPressed['s'] && player1.y + paddleHeight < canvas.height) {
        player1.y += paddleSpeed;
    }

    if (keysPressed['ArrowUp'] && player2.y > 0) {
        player2.y -= paddleSpeed;
    } else if (keysPressed['ArrowDown'] && player2.y + paddleHeight < canvas.height) {
        player2.y += paddleSpeed;
    }
}

let gameOver = false;

function checkWinner() {
    if (player1Score === maxScore) {
        if (!gameOver){
            setTimeout(() => {
                alert('Player 1 wins!');
                resetGame();
            }, 100);
        }
        gameOver = true;
    } else if (player2Score === maxScore) {
        if (!gameOver) {
            setTimeout(() => {
                alert('Player 2 wins!');
                resetGame();
            }, 100);
        }
        gameOver = true;
    }
}

function resetGame() {
    gameOver = false;
    player1Score = 0;
    player2Score = 0;
    player1.y = (canvas.height - paddleHeight) / 2;
    player2.y = (canvas.height - paddleHeight) / 2;
    resetBall();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawField();
    drawPaddle(player1.x, player1.y);
    drawPaddle(player2.x, player2.y);
    drawBall(ball.x, ball.y);
    drawScore();
    movePaddles();
}

function gameLoop() {
    if (!gamePaused) {
        moveBall();
        checkWinner();
    }
    draw();
    requestAnimationFrame(gameLoop);
}

// resetBall();
gameLoop();

