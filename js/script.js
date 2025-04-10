const canvas = $("#gameCanvas")[0];
const context = canvas.getContext("2d");

const $overlay = $("#overlay");
const $startBtn = $("#startBtn");
const $retryBtn = $("#retryBtn");
const $scoreBoard = $("#scoreBoard");
const $levelBoard = $("#lvl-no");

const ball_initial_speed = 2;
const paddle_speed = 7;
const ball_start_offset = 30;

let ballRadius = 10;
let ballX;
let ballY;
let ballSpeedX;
let ballSpeedY;
let paddleHeight = 10, paddleWidth = 75, paddleX, rightPressed = false, leftPressed = false;
let level = 1, maxLevel = 4;
let bricksRemaining;
let score = 0;
const brickColumnCount = 5, brickWidth = 75, brickHeight = 20, brickPadding = 10, brickOffsetTop = 30, brickOffsetLeft = 30;
let bricks = [];
let animationId;

$(document).on("keydown", keyDownHandler);
$(document).on("keyup", keyUpHandler);

$startBtn.on("click", startGame);
$retryBtn.on("click", startGame);


//----- functions -------

function updateLevel() {
    $levelBoard.text(level);
}


function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
    else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
}

function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
    else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
}

function startGame() {
    $("#gameOverMsg").hide();
    $retryBtn.hide().prop("disabled", true);
    $startBtn.prop("disabled", true).hide();

    resizeCanvas();
    resetGame();
    resetBallAndPaddle(); 
    draw();
}

function createBricks() {
    bricks = [];
    bricksRemaining = 0;
    let rows = 3 + level - 1;

    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < rows; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
            bricksRemaining++;
        }
    }
}

function drawBall() {
    context.beginPath();
    context.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    context.fillStyle = "#ffffff";
    context.fill();
    context.closePath();
}

function drawPaddle() {
    context.beginPath();
    context.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    context.fillStyle = "#f39c12";
    context.fill();
    context.closePath();
}

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < bricks[c].length; r++) {
            if (bricks[c][r].status === 1) {
                let brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                let brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                context.beginPath();
                context.rect(brickX, brickY, brickWidth, brickHeight);
                context.fillStyle = "#eb0202";
                context.fill();
                context.closePath();
            }
        }
    }
}

function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < bricks[c].length; r++) {
            let b = bricks[c][r];
            if (b.status === 1) {
                if (ballX > b.x && ballX < b.x + brickWidth && ballY > b.y && ballY < b.y + brickHeight) {
                    ballSpeedY = -ballSpeedY;
                    b.status = 0;
                    bricksRemaining--;
                    score += 10;
                    updateScore();

                    if (bricksRemaining === 0) {
                        handleLevelCompletion();
                    }
                    return; 
                }
            }
        }
    }
}

function handleLevelCompletion() {
    if (level < maxLevel) {
        level++;
        ballSpeedX *= 1.2;
        ballSpeedY *= 1.2;
        paddleWidth = Math.max(40, paddleWidth - 10);
        alert(`🎉 Congrats! You Passed Level ${level - 1}`);
        updateLevel();
        resetBallAndPaddle();
        createBricks();
    } else {
        alert("🏆 Congrats! You won all levels!");
        showRetry();
    }
}

function updateScore() {
    $scoreBoard.text(score);
}

function draw() {
    resizeCanvas(); 

    context.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    collisionDetection();
    movePaddle();

    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Wall Collision
    if (ballX < ballRadius || ballX > canvas.width - ballRadius) ballSpeedX = -ballSpeedX;
    if (ballY < ballRadius) ballSpeedY = -ballSpeedY;
    else if (ballY > canvas.height - ballRadius) {
        if (ballX > paddleX && ballX < paddleX + paddleWidth) ballSpeedY = -ballSpeedY;
        else {
            showRetry();
            return;
        }
    }

    animationId = requestAnimationFrame(draw);
}

function movePaddle() {
    const paddleSpeed = canvas.width * 0.01;
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += paddleSpeed;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= paddleSpeed;
    }
}

function resizeCanvas() {
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
    }
}


function resetBallAndPaddle() {
    ballX = canvas.width / 2;
    ballY = canvas.height - ball_start_offset;
    ballSpeedX = ball_initial_speed * (Math.random() < 0.5 ? -1 : 1);
    ballSpeedY = -ball_initial_speed;
    paddleX = (canvas.width - paddleWidth) / 2;
}

function resetGame() {
    level = 1;
    score = 0;
    paddleWidth = 75;
    resetBallAndPaddle();
    createBricks();
    updateScore();
    updateLevel();
}

function showRetry() {
    $retryBtn.prop("disabled", false).show(); 
    $startBtn.prop("disabled", false).hide();
    $("#gameOverMsg").fadeIn(); 
    cancelAnimationFrame(animationId);
}

