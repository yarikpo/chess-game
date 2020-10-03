var CELL_SIZE = 64
var CELL_MARGIN = 0
var CELL_COUNT_VERT = 8
var CELL_COUNT_HOR = 3

var timeS = 0;
var timeD = 0;

const canvas = document.getElementById('game');

var ctx = canvas.getContext('2d');

function drawTimer() {
    ctx.beginPath();
    ctx.font = '16px Helvetica';
    ctx.fillStyle = 'red';
    ctx.fillText('Timer: ' + timeD/1000, 10, 20);
    ctx.closePath();
}

function drawTurns() {
    ctx.beginPath();
    ctx.font = '16px Helvetica';
    ctx.fillStyle = 'red';
    ctx.fillText('Turns: ' + gameState.turn_count, 10, 40);
    ctx.closePath();
}

var gameState = {
    lastPlayerMove: null,
    player1: "",
    player2: "",
    started: false,
    turn: "white",
    turn_count: 0,
    table: makeTable(CELL_COUNT_VERT, CELL_COUNT_HOR)
}

function makeTable(cols, rows) {
    table = []
    for (let i = 0; i < cols; ++i) {
        table.push([]);
        for (let j = 0; j < rows; ++j) {
            table[i].push({ i: i, j: j, pawn: "" });
        }
    }
    return table
}

function drawTable() {
    canvas.width = CELL_SIZE * CELL_COUNT_HOR;
    canvas.height = CELL_SIZE * CELL_COUNT_VERT;
    for (let i = 0; i < CELL_COUNT_VERT; i++) {
        for (let j = 0; j < CELL_COUNT_HOR; j++) {
            if ((i + j) % 2 === 1) drawCell(i, j, '#000000');
            if ((i + j) % 2 === 0) drawCell(i, j, '#FFFFFF');
            
        }
    }
}

function drawCell(i, j, color) {
    ctx.beginPath();
    ctx.rect(j * CELL_SIZE, i * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    ctx.fillStyle = color;
    ctx.strokeStyle = 'silver';
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
}

function drawPawn(i, j, type) {
    ctx.beginPath();
    ctx.rect(j * CELL_SIZE + CELL_SIZE * 0.2, i * CELL_SIZE + CELL_SIZE * 0.2, CELL_SIZE * 0.6, CELL_SIZE * 0.6);
    ctx.fillStyle = type;
    if (type === "white") {
        ctx.strokeStyle = "#000";
    } else if (type === "black") {
        ctx.strokeStyle = "#FFF"
    }
    ctx.fill();
    ctx.stroke();  
    ctx.closePath();
}

function drawPawns() {
    gameState.table.forEach((row, i) => {
        row.forEach((cell, j) => {
            if (cell.pawn !== "") {
                drawPawn(i, j, cell.pawn)
            }
        })
    });
}

function handleAiMove() {
    var min = 0; 
    var max = CELL_COUNT_VERT;          
    const i = Math.floor(Math.random() * (max - min)) + min;
    max = CELL_COUNT_HOR;
    const j = Math.floor(Math.random() * (max - min)) + min;

    if (gameState.turn === 'white') {
        if (gameState.table[i][j].pawn === 'white') {
            handleAiMove();
            return;
        }
        
        for (let inow = i; inow < CELL_COUNT_VERT; ++inow) {
            if (gameState.table[inow][j].pawn === 'black') {
                handleAiMove();
                return;
            }
        }
    }

    if (gameState.turn === 'black') {
        if (gameState.table[i][j].pawn === 'black') {
            handleAiMove();
            return;
        }

        for (let inow = i; inow >= 0; --inow) {
            if (gameState.table[inow][j].pawn === 'white') {
                handleAiMove();
                return;
            }
        }
    }

    if (gameState.turn === 'white') {
        if (gameState.turn_count < 2 && i <= CELL_COUNT_VERT / 2 - 1) return;

        for (let inow = 0; inow < CELL_COUNT_VERT; ++inow) {
            if (gameState.table[inow][j].pawn === 'white') gameState.table[inow][j].pawn = '';
        }

        gameState.table[i][j].pawn = 'white';
        gameState.turn = 'black';

        
    }
    else if (gameState.turn === 'black') {
        if (gameState.turn_count < 2 && i > CELL_COUNT_VERT / 2 - 1) return;

        for (let inow = 0; inow < CELL_COUNT_VERT; inow++) {
            if (gameState.table[inow][j].pawn === 'black') gameState.table[inow][j].pawn = '';
        }

        gameState.table[i][j].pawn = 'black';
        gameState.turn = 'white';

        
    }

    gameState.turn_count++;
}

function handlePlayerMove() {
    timeD = new Date().getTime() - timeS;
    console.log(timeS);
    if (timeD > 10000) gameOver();


    if (gameState.lastPlayerMove == null) return;
    const i = gameState.lastPlayerMove.i;
    const j = gameState.lastPlayerMove.j;
    if (gameState.turn === 'white') {
        for (let inow = i; inow < CELL_COUNT_VERT; ++inow) {
            if (gameState.table[inow][j].pawn === 'black') return;
        }
    }

    if (gameState.turn === 'black') {
        for (let inow = i; inow >= 0; --inow) {
            if (gameState.table[inow][j].pawn === 'white') return;
        }
    }

    if (gameState.turn === 'white') {
        if (gameState.turn_count < 2 && i <= CELL_COUNT_VERT / 2 - 1) return;

        for (let inow = 0; inow < CELL_COUNT_VERT; ++inow) {
            if (gameState.table[inow][j].pawn === 'white') gameState.table[inow][j].pawn = '';
        }

        gameState.table[i][j].pawn = 'white';
        gameState.turn = 'black';

        
    }
    else if (gameState.turn === 'black') {
        if (gameState.turn_count < 2 && i > CELL_COUNT_VERT / 2 - 1) return;

        for (let inow = 0; inow < CELL_COUNT_VERT; inow++) {
            if (gameState.table[inow][j].pawn === 'black') gameState.table[inow][j].pawn = '';
        }

        gameState.table[i][j].pawn = 'black';
        gameState.turn = 'white';

        
    }

    gameState.turn_count++;
    gameState.lastPlayerMove = undefined;
}

function checkIfGameOver() {
    let f1 = true;
    let f2 = true;
    for (var j = 0; j < CELL_COUNT_HOR; j++) {
        if (!(gameState.table[0][j].pawn === "black" && gameState.table[1][j].pawn === "white")) f1 = false;
    }
    for (var j = 0; j < CELL_COUNT_HOR; j++) {
        if (!(gameState.table[CELL_COUNT_VERT-2][j].pawn === "black" && gameState.table[CELL_COUNT_VERT-1][j].pawn === "white")) f2 = false;
    }

    if (!(f1 || f2)) return;

    gameOver()
}

function gameOver() {
    alert('Game Over!');
    gameState.started = false;
    gameState.table = makeTable(CELL_COUNT_VERT, CELL_COUNT_HOR)
}

function updateGameState() {
    if (gameState.started === false) return;

    if (gameState.turn_count % 2 === 0) {
        if (gameState.player1 === "player") {
            handlePlayerMove()
        } else if (gameState.player1 === "ai") {
            handleAiMove()
        }
    }

    if (gameState.turn_count % 2 === 1) {
        if (gameState.player2 === "player") {
            handlePlayerMove()
        } else if (gameState.player2 === "ai") {
            handleAiMove()
        }
    }

    checkIfGameOver()
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawTable();
    
    drawPawns();
    drawTimer();
    drawTurns();
}

function update() {
    updateGameState();
    draw();
}

function startGame() {
    gameState.table = makeTable(CELL_COUNT_VERT, CELL_COUNT_HOR)
    console.log("GAME STARTED!")
    for (let i = 0; i < CELL_COUNT_HOR; i++) {
        gameState.table[0][i].pawn = "black"
        gameState.table[CELL_COUNT_VERT-1][i].pawn = "white"
    }
    var p1 = document.getElementById('player_one');

    var p2 = document.getElementById('player_two');

    gameState.player1 = p1.options[p1.selectedIndex].value;
    gameState.player2 = p2.options[p2.selectedIndex].value;
    gameState.started = true;
    gameState.turn = "white"
    gameState.turn_count = 0
    timeS = new Date().getTime()
    timeD = 0;
}

setInterval(update, 1000/60);

canvas.addEventListener('mousedown', handleMouseDown, false);

function handleMouseDown(e) {
    const i = (e.offsetY - e.offsetY % CELL_SIZE) / CELL_SIZE;
    const j = (e.offsetX - e.offsetX % CELL_SIZE) / CELL_SIZE;
    gameState.lastPlayerMove = { i: i, j: j };

    timeS = new Date().getTime();
}

function changeGameWidth(delta) {
    CELL_COUNT_HOR = Math.min(Math.max(3, delta+CELL_COUNT_HOR), 50)
    gameState.table = makeTable(CELL_COUNT_VERT, CELL_COUNT_HOR)
}