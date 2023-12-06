//board
let board;
let boardWidth = 1000;
let boardHeight = 640;
let context;

//bird
let birdWidth = 34; //width/height ratio = 408/228 = 17/12
let birdHeight = 24;
let birdX = boardWidth/8;
let birdY = boardHeight/2;
let birdImg;

let bird = {
    x : birdX,
    y : birdY,
    width : birdWidth,
    height : birdHeight
}

//pipes
let pipeArray = [];
let pipeWidth = 64; //width/height ratio = 384/3072 = 1/8
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

//physics
let velocityX = -2; //pipes moving left speed
//the player jump speed (is changed in)
let velocityY = 0;
//sets the gravity for the player (the speed at which the player falls down)
let gravity = 0.4;

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
    birdImg = new Image();
    birdImg.src = "./flappybird.png";
    birdImg.onload = function() {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    }

    //adds the image to the top pipe
    topPipeImg = new Image();
    topPipeImg.src = "./tpipe.png";

    //adds the image to the bottom pipe
    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bpipeborder.png";

    //calls the update function on window load to start the game
    requestAnimationFrame(update);

    //sets the interval at which the pipes are generated
    setInterval(placePipes, 1500); //every 1.5 seconds

    //adds the functionality of moving the bird when you press certain keys
    document.addEventListener("keydown", moveBird);
}

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
    bird.y = Math.max(bird.y + velocityY, 0); 
    //draws the player on the screen using the image asset, x and y values, and the width and height of player character
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    //if the player touches the bottom of the board, the game is over
    if (bird.y > board.height) {
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
        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5; //0.5 because there are 2 pipes! so 0.5*2 = 1, 1 for each set of pipes
            pipe.passed = true;
        }

        //Checks if player has collided with pipe and gives game over state
        if (detectCollision(bird, pipe)) {
            gameOver = true;
        }
    }

    //clears pipes when the pipe has passed the player but not when the pipe array is empty
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift(); //removes first element from the array
    }

    //Draws the score on the screen as white text 45px in size in the top left corner
    context.fillStyle = "white";
    context.font="45px sans-serif";
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
    let randomPipeY = pipeY - pipeHeight/4 - Math.random()*(pipeHeight/2);
    let openingSpace = board.height/4;

    //Creates a top pipe and pushes it into the pipe array to be rendered
    let topPipe = {
        //Adds the image to the pipe
        img : topPipeImg,
        //Give the pipe a starting x position
        x : pipeX,
        //Give the pipe a random y position based on randomPipeY calculation
        y : randomPipeY,
        //Sets the pipes width based on pipeWidth value
        width : pipeWidth,
        //Sets the pipes height based on pipeHeight value
        height : pipeHeight,
        //Gives the pipe a passed bool to check if bird has passed the pipe to give score
        passed : false
    }
    pipeArray.push(topPipe);

    //Creates bottom pipe and pushes it into the pipe array to be rendered
    let bottomPipe = {
        img : bottomPipeImg,
        x : pipeX,
        //Puts the bottom pipe under the top pipe with openingSpace as the gap between them
        y : randomPipeY + pipeHeight + openingSpace,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    pipeArray.push(bottomPipe);
}

//Takes event parameter to move the bird
function moveBird(e) {
    //Keys that will move the bird
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        // negative values move the bird upwards on the screen
        velocityY = -6;

        //resets the game
        if (gameOver) {
            //resets birds y position
            bird.y = birdY;
            //empties the pipes array and removes all pipes from screen
            pipeArray = [];
            //resets the score
            score = 0;
            //resets the bool to signify game is starting again
            gameOver = false;
            velocityX = -2;
        }
    }
}

//Detects collision between the bird and the pipe by checking the birds x and y position against the pipes x and y position
function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}