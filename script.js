//NEEDS TO BE MOVED

//test function to send data
function submitScore() {
  // Get data from the input field
  let name = document.querySelector("#data").value;
  // Send information to back end with name and score
  fetch(
    `https://wp.arashbesharat.com/wp-json/leaderboard/v1/submit-score?name=${name}&score=${score}`
  );
}

function handleNameInput(name) {
  if (localStorage.getItem("name")) {
    let input = document.querySelector("#data");
    input.value = name;
  } else {
    localStorage.setItem("name", name);
  }
}

//Leaderboard
async function getLeaderboard() {
  let url = "https://wp.arashbesharat.com/wp-json/leaderboard/v1/leaderboard";
  const result = await fetch(url);
  const data = await result.json();
  const listContainer = document.querySelector("#jsonList");

  //Get the top 10 results
  for (let i = 0; i < Math.min(data.length, 10); i++) {
    const item = data[i];
    const listItem = document.createElement("li");
    listItem.textContent = `name: ${item.name} score: ${item.score}`;
    listContainer.appendChild(listItem);
  }
}

//board
let board;
let boardWidth = 1000;
let boardHeight = 640;
let context;

//player
let playerWidth = 34; //width/height ratio = 408/228 = 17/12
let playerHeight = 24;
let playerX = boardWidth / 8;
let playerY = boardHeight / 2;
let playerImg;

let player = {
  x: playerX,
  y: playerY,
  width: playerWidth,
  height: playerHeight,
};

//pipes
let pipeArray = [];
let pipeWidth = 64; //width/height ratio = 384/3072 = 1/8
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let randomImageIndex;
const imageArray = [
  "./assets/pipe1.png",
  "./assets/pipe2.png",
  "./assets/pipe3.png",

];

//physics
let velocityX = -5; //pipes moving left speed
//the player jump speed (is changed in)
let velocityY = 0;
//sets the gravity for the player (the speed at which the player falls down)
let gravity = 0.8;

//variable to check and decide when the game is over
let gameOver = false;
//score value that will increase when the player passes a pipe
let score = 0;

//initialization of the game, this runs when the window is loaded
window.onload = function() {
  //gets the canvas element
  board = document.getElementById("board");
  //sets the board height to the value of boardHeight
  board.height = boardHeight;
  //sets the board width to the value of boardWidth
  board.width = boardWidth;
  //used for drawing on the board and sets it to be a 2d board
  context = board.getContext("2d");

  //adds the image to the player
  playerImg = new Image();
  playerImg.src = "./assets/flappybird.png";
  playerImg.onload = function () {
    context.drawImage(playerImg, player.x, player.y, player.width, player.height);
  };

  //adds the image to the top pipe
  topPipeImg = new Image();
  topPipeImg.src = "./assets/tpipe.png";

  //calls the update function on window load to start the game
  requestAnimationFrame(update);

  //sets the interval at which the pipes are generated
  setInterval(placePipes, 1500); //every 1.5 seconds

  //adds the functionality of moving the player when you press certain keys
  document.addEventListener("keydown", movePlayer);
};

//function that is updating the content on the board by calling itself on each frame update
function update() {
  //calls this function again when the frame updates
  requestAnimationFrame(update);
  //stop running this function when the game is over
  if (gameOver) {
    return;
  }
  context.clearRect(0, 0, board.width, board.height);

  // Change the speed at which the pipes move towards the player
  if (score >= 3) {
    velocityX += -0.01;
  }

  //apply gravity to the player and limit the player to no be able to go above the canvas
  velocityY += gravity;
  player.y = Math.max(player.y + velocityY, 0);
  //draws the player on the screen using the image asset, x and y values, and the width and height of player character
  context.drawImage(playerImg, player.x, player.y, player.width, player.height);

  //if the player touches the bottom of the board, the game is over
  if (player.y > board.height) {
    gameOver = true;
  }

  //draws the pipe on the board
  for (let i = 0; i < pipeArray.length; i++) {
    let pipe = pipeArray[i];
    //adds the speed to the pipe
    pipe.x += velocityX;
    //draws the pipe on the board
    context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

    //If player has passed a pipe, add 1 score to the player
    if (!pipe.passed && player.x > pipe.x + pipe.width) {
      score += 0.5; //0.5 because there are 2 pipes! so 0.5*2 = 1, 1 for each set of pipes
      pipe.passed = true;
    }

    //Checks if player has collided with pipe and gives game over state
    if (detectCollision(player, pipe)) {
      gameOver = true;
    }
  }

  //clears pipes when the pipe has passed the player but not when the pipe array is empty
  while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
    pipeArray.shift(); //removes first element from the array
  }

  //Draws the score on the screen as white text 45px in size in the top left corner
  context.fillStyle = "white";
  context.font = "45px sans-serif";
  context.fillText(score, 5, 45);

  //Adds game over text to signify to player that the game is over
  if (gameOver) {
    context.fillText("GAME OVER", 5, 90);
  }
}

//Creates new pipes to be rendered
function placePipes() {
  //If the game ends, we stop placing pipes
  if (gameOver) {
    return;
  }

  //(0-1) * pipeHeight/2.
  // 0 -> -128 (pipeHeight/4)
  // 1 -> -128 - 256 (pipeHeight/4 - pipeHeight/2) = -3/4 pipeHeight

  //To make the Pipes Y position be different each time we have to randomize the Y position
  //Takes value of pipeY and depending on the outcome of Math.random will place the pipe further up or down on the screen
  let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
  let openingSpace = board.height / 3;

  //random number for the index of the image path
  randomImageIndex = Math.floor(Math.random() * imageArray.length);
  
  //Creates a top pipe and pushes it into the pipe array to be rendered
  let topPipe = {
    //Adds the image to the pipe
    img: topPipeImg,
    //Give the pipe a starting x position
    x: pipeX,
    //Give the pipe a random y position based on randomPipeY calculation
    y: randomPipeY,
    //Sets the pipes width based on pipeWidth value
    width: pipeWidth,
    //Sets the pipes height based on pipeHeight value
    height: pipeHeight,
    //Gives the pipe a passed bool to check if player has passed the pipe to give score
    passed: false,
  };
  pipeArray.push(topPipe);

  //Creates bottom pipe and pushes it into the pipe array to be rendered
  let bottomPipe = {
    //gives the bottom pipe a new image because we are changing it with every new pipe
    img: new Image(),
    x: pipeX,
    //Puts the bottom pipe under the top pipe with openingSpace as the gap between them
    y: randomPipeY + pipeHeight + openingSpace,
    width: pipeWidth,
    height: pipeHeight,
    passed: false,
  };
  //Selects and image path from the array with the index being random
  bottomPipe.img.src = imageArray[randomImageIndex];
  pipeArray.push(bottomPipe);
}

//Takes event parameter to move the player
function movePlayer(e) {
  //Keys that will move the player
  if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
    // negative values move the player upwards on the screen
    velocityY = -10;

    //resets the game
    if (gameOver) {
      //resets players y position
      player.y = playerY;
      //empties the pipes array and removes all pipes from screen
      pipeArray = [];
      //resets the score
      score = 0;
      //resets the bool to signify game is starting again
      gameOver = false;
      //resets the speed of the pipes
      velocityX = -5;
    }
    
  }
}

//Detects collision between the player and the pipe by checking the players x and y position against the pipes x and y position
function detectCollision(a, b) {
  return (
    a.x < b.x + b.width && //a's top left corner doesn't reach b's top right corner
    a.x + a.width > b.x && //a's top right corner passes b's top left corner
    a.y < b.y + b.height && //a's top left corner doesn't reach b's bottom left corner
    a.y + a.height > b.y
  ); //a's bottom left corner passes b's top left corner
}
