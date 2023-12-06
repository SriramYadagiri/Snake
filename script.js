// Access the html canvas element and get the 2d context to draw shapes to the screen
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Set the width and height of the canvas to 500px
canvas.width = 500;
canvas.height = 500;

// Initialize the number of columns and rows to 30
const cols = 15;
const rows = 15;

let lastRenderTime = 0; // Last time a scene was rendered
const SNAKE_SPEED = 7; // Speed of the snake

let score = 0; // Stores the score of each game
let highscore = 0; // Stores the highest score of the session

// Set the width of each tile that the board is made up of
const width = canvas.width / cols;

let keys = []; // Stores the key presses
let frames = 0; // Number of frames that pass
let gameOver = true; // A flag used to tell if the game is over or not
let animateID; // Id used for the animation

// Add the event listeners to detect key presses and update the keys list
document.addEventListener('keydown', e => keys[e.keyCode] = true);
document.addEventListener('keyup', e => keys[e.keyCode] = false);

// Initialize the food object
let food = {
  x: Math.floor(Math.random() * cols), //  Random integer between 0 and the # of columns excluding the # of columns
  y: Math.floor(Math.random() * rows), //  Random integer between 0 and the # of rows excluding the # of rows
  draw: function() {
    grid[food.x][food.y] = 2; // Set the index in the grid at the food's position to 2
  },
  generate: function() {
    let emptyTiles = getEmptyTiles(); // Get a list of all the empty tiles in the grid

    let tile = emptyTiles[Math.floor(Math.random() * emptyTiles.length)]; // Choose a random empty tile

    //Set the food's position to the random empty tile's
    food.x = tile.x;
    food.y = tile.y;
  }
}

// Initialize the snake object
let snake = {
  tail: [], // Stores all the coordinates for every member of the tail of the snake
  x: Math.floor(cols / 2), // x-coord of the head of the snake
  y: Math.floor(rows / 2), // y-coord of the head of the snake
  vx: 0, // The direction the snake will head in the x direction
  vy: 1, // The direction the snake will head in the x direction

  draw: function() {
    // Set every tile on the grid that the snake is covering to 1
    grid[snake.x][snake.y] = 1;
    for (let i = 0; i < snake.tail.length; i++) {
      grid[snake.tail[i].x][snake.tail[i].y] = 1;
    }
  },

  update: function() {
    // Loop backwards through the tail of the snake
    for (let i = snake.tail.length - 1; i > -1; i--) {
      if (i > 0) snake.tail[i] = snake.tail[i - 1]; // Set every member of the tail to the position of the member in front of it
      else snake.tail[0] = { x: snake.x, y: snake.y }; // Set the first member of the tail to the position of the head
    }

    //Move the snake in the direction that's inputed
    snake.x = snake.x + snake.vx;
    snake.y = snake.y + snake.vy;

    //Loop therough the tail and check if the snake head ever touches any member of the tail, if it does the game is over
    for (let i = 0; i < snake.tail.length; i++) {
      if (snake.tail[i].x == snake.x && snake.tail[i].y == snake.y) gameOver = true;
    }
  },
};

// Initialize the grid
let grid = [];

for (let i = 0; i < cols; i++) {
  grid[i] = []; // Add an array for each column
  for (let j = 0; j < rows; j++) {
    grid[i][j] = 0; // Initialize every element of the 2-dimensional array to 0 representing an empty square
  }
}

function main(currentTime) {
  if (gameOver) {
    resetGame();
    return; //If the game is over exit the loop
  }
  window.requestAnimationFrame(main); // Start the animation loop
  const secondsSinceLastRender = (currentTime - lastRenderTime) / 1000; // Seconds since last render
  // If Seconds since last render is less than 1 / Snake_Speed don't go through the rest of the loop
  if (secondsSinceLastRender < 1 / SNAKE_SPEED) return;


  lastRenderTime = currentTime // Set the last render time

  // Clear the grid (make every square blank)
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j] = 0;
    }
  }

  // If the snake eats the food move the food to a new square and increase the snake's length
  if (snake.x == food.x && snake.y == food.y) {
    food.generate();
    snake.tail.push({ x: snake.x, y: snake.y });
    score++;
    highscore = Math.max(score, highscore);
  }

  // If the snake hits the border of the screen end the game
  if (snake.x < 0 || snake.x >= cols || snake.y < 0 || snake.y >= rows) gameOver = true;

  // Draw the snake and food
  snake.draw();
  food.draw();

  // Draw the grid and handle any key presses
  drawGrid();

  // Every 5 frames update the snake
  handleKeyPress();
  snake.update();
  key = null;
}

function resetGame() {
  // Reset the game
  gameOver = true;
  lastRenderTime = 0;
  snake.x = Math.floor(cols / 2);
  snake.y = Math.floor(rows / 2);
  snake.tail = [];
  snake.vx = 0;
  snake.vy = 0;

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j] = 0;
    }
  }

  drawGrid();

  food.generate();

  // Draw the snake and food
  snake.draw();
  food.draw();

  // Draw the grid and hdocument.addEventListener('keypress', function() {
  drawCenteredText("Press any key to start the game");
  drawCenteredText("Score: " + score, 0, 50);
  score = 0;
  drawCenteredText("High Score: " + highscore, 0, 100);
};

drawGrid();
resetGame();
document.addEventListener('keydown', function() {
  // Start the game here
  if (gameOver) {
    gameOver = false;
    window.requestAnimationFrame(main);
  }
});

// Draw every tile it's respective color
function drawGrid() {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      // If the square is blank the color is black if not it's either food or a part of the snake
      // If it's food the color should be purple if it's part of the snake it should be green
      let color = grid[i][j] == 0 ? 'DarkSlateGrey' : grid[i][j] == 1 ? 'steelblue' : "darksalmon";
      rect(i * width, j * width, width, width, color); // Draw a rectangle at the actual x and y value on the canvas not it's index in the grid array
    }
  }
}

// Returns a list of all the coordinates of empty tiles in the grid
function getEmptyTiles() {
  let emptyTiles = [];

  // Loop through every tile of the grid
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      // If the snake's is on the tile dont add it to the list
      if (snake.x == i && snake.y == j) continue;

      // If the tile contains part of the snake's tail is on the tile record it as empty
      let empty = true;
      for (let coord of snake.tail) {
        if (coord.x == i && coord.y == j) {
          empty = false;
          break;
        }
      }

      //If the tile is empty add it to the list
      if (empty) emptyTiles.push({ x: i, y: j });
    }
  }

  return emptyTiles;
}

// Return true if the key pressed is an arrow key
function validKey(keyCode) {
  return keyCode >= 37 && keyCode <= 40;
}

function handleKeyPress() {
  if (keys[37] && (snake.tail.length == 0 || snake.vx != 1)) { // If the left arrow key is down and the snake isn't going to the right
    snake.vy = 0;
    snake.vx = -1;
  } else if (keys[38] && (snake.tail.length == 0 || snake.vy != 1)) { // If the up arrow key is down and the snake isn't going down
    snake.vx = 0;
    snake.vy = -1;
  } else if (keys[39] && (snake.tail.length == 0 || snake.vx != -1)) { // If the right arrow key is down and the snake isn't going to the left
    snake.vy = 0;
    snake.vx = 1;
  } else if (keys[40] && (snake.tail.length == 0 || snake.vy != -1)) { // If the down arrow key is down and the snake isn't going up
    snake.vx = 0;
    snake.vy = 1;
  }
}

//Draw a rectangle at a given coordinate with a given width and height
function rect(x, y, width, height, color) {
  ctx.globalAlpha = 0.7;

  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
  ctx.strokeStyle = "DarkSeaGreen";
  ctx.strokeRect(x, y, width, height);
}

//Draws text at the center of the canvas
function drawCenteredText(text, offsetX = 0, offsetY = 0) {
  ctx.font = "30px Arial";
  ctx.fillStyle = "black";
  ctx.textAlign = "center";
  ctx.fillText(text, canvas.width / 2 + offsetX, canvas.height / 2 + offsetY);
}