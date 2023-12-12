// sounds
let backgroundSound = document.getElementById("backgroundSound");
backgroundSound.volume = 0.1;
let jumpSound = document.getElementById("jumpSound");
let loseSound = document.getElementById("loseSound");
loseSound.volume = 0.5;
let startSound = document.getElementById("startSound");
startSound.volume = 0.5;

//board
let board;
let boardWidth = window.innerWidth;
let boardHeight = window.innerHeight;
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
let pipeInterval;

let topPipeImg;
let randomImageIndex;
let imageArray = [];

// Adding all pipe paths into array
for (let i = 1; i <= 17; i++) {
  imageArray.push(`./assets/pipe${i}.png`);
}

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

// Saved player name
let savedPlayerName = loadPlayerName();

// Other elements
let playerName = document.querySelector("#playerName");
let modalContent = document.querySelector("#menuModal");
let playAgainBtn = document.querySelector("#playAgainBtn");
let leaderboardBtn = document.querySelector("#leaderboardBtn");
let scoreForm = document.querySelector(".score-form");
let submitBtn = document.querySelector("#submitBtn");
let successText = document.querySelector("#score-submitted");
let userScore = document.querySelector(".userScore");

//function that is updating the content on the board by calling itself on each frame update
function update() {
  //stop running this function when the game is over
  if (gameOver) {
    showGameOver();
    return;
  }
  //calls this function again when the frame updates
  requestAnimationFrame(update);
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
  context.fillStyle = "black";
  context.font = "45px sans-serif";
  context.fillText(score, (boardWidth / 2) - 20, 180);
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
  jumpSound.currentTime = 0; // Reset the sound to the beginning
  jumpSound.play();
  //Keys that will move the player
  if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
    // negative values move the player upwards on the screen
    e.preventDefault();
    velocityY = -10;
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

// Needs to be async and check the server response
async function submitScore() {
  // Get data from the input field
  let name = playerName.value;
  if (name === "") {
    // The input is empty
    alert("Please enter a name, don't be shy!.");
  } else {
    try {
      // Send information to the backend with name and score
      let response = await fetch(
        `https://wp.arashbesharat.com/wp-json/leaderboard/v1/submit-score?name=${name}&score=${score}`
      );

      if (response.ok) {
        // Server response is 200 OK
        console.log("Score submitted successfully!");
        scoreForm.style.display = "none";
        successText.style.display = "block";
        savePlayerName(name);
      } else {
        // Server returned an error status code
        console.error(`Error: ${response.status} - ${response.statusText}`);
        // Handle the error as needed
      }
    } catch (error) {
      // An exception occurred during the fetch
      console.error("Fetch error:", error);
      // Handle the error as needed
    }
  }
}

function gameStart() {
  startSound.play();
  backgroundSound.currentTime = 0; // Reset the sound to the beginning
  backgroundSound.play();
  successText.style.display = "none";
  clearInterval(pipeInterval);
  //calls the update function on window load to start the game
  requestAnimationFrame(update);

  //sets the interval at which the pipes are generated
  pipeInterval = setInterval(placePipes, 1500); //every 1.5 seconds

  //adds the functionality of moving the player when you press certain keys
  document.addEventListener("keydown", movePlayer);

  modalContent.style.display = "none";

  //resets the game
  if (gameOver) {
    //resets players y position
    player.y = playerY;
    //empties the pipes array and removes all pipes from screen
    pipeArray = [];
    //resets the score
    score = 0;
    //resets the speed of the pipes
    velocityX = -5;
    //reset velocityY
    velocityY = 0;
    //resets the bool to signify game is starting again
    gameOver = false;
  }
}

function showGameOver() {
  document.querySelector("#heading").innerText = 'Game Over'
  playAgainBtn.innerText = 'Play again'
  loseSound.play();
  backgroundSound.pause();
  modalContent.style.display = "block";
  if(score > 0)
  {
    scoreForm.style.display = "flex";
    document.querySelector("#playerName").style.display = "block";
    submitBtn.style.display = "block";
    userScore.style.display = "block";
    userScore.textContent = `Score: ${score}`;
  }
}

playAgainBtn.addEventListener("click", gameStart);

leaderboardBtn.addEventListener("click", function () {
  document.location.href = "./leaderboard.html";
});

// Save player name
function savePlayerName(playerName) {
  localStorage.setItem("playerName", playerName);
}

// Load player name
function loadPlayerName() {
  return localStorage.getItem("playerName");
}
submitBtn.addEventListener("click", submitScore);

//initialization of the game, this runs when the window is loaded
window.onload = function () {
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
    context.drawImage(
      playerImg,
      player.x,
      player.y,
      player.width,
      player.height
    );
  };

  //adds the image to the top pipe
  topPipeImg = new Image();
  topPipeImg.src = "./assets/toppipe.png";
};
