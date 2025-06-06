import { createCanvas } from "./canvas.js";
import { update, levelState } from "./update.js";
import { render, generateMaze } from "./render.js";
import { images, areImagesReady } from "./image.js";
import { player } from "./player.js";
import { enemy } from "./enemy.js";
import { initEnemy } from "./enemy.js";
import { placeHoles } from "./hole.js";
import { startEnemySound, stopEnemySound } from "./enemy.js";
import { DEFAULT_POINTS, LEVEL_START_TIME, MAX_LIVES, TORCH_INITIAL_ENERGY } from "./constants.js";
import { placeBatteries } from "./battery.js";
import { placeTimeLosers } from "./timeLosing.js";
import { saveScore } from "./leaderboard.js";



// Game configuration
let MAZE_ROWS;
let MAZE_COLS;
let CANVAS_WIDTH = 640;
let CANVAS_HEIGHT = 640;
let CELL_SIZE = 64; // Define this to make calculations consistent

// Game state
let ctx;
let lastTimestamp = 0;
let isGameRunning = false;
let canvasInitialized = false;
export const gameState = {
    currentLevel: 1,
    lives: MAX_LIVES,
    timeLeft: LEVEL_START_TIME, 
    points: DEFAULT_POINTS, // Using constant for initial points
    isGameOver: false
  };

// Light settings
export let introVisible = true;
let introTimer = 0;

// For tracking points reduction
let pointsTimer = 0;


/**
 * Initialize the game canvas (only once)
 */
function initCanvas() {
    // Remove existing canvas if it exists
    const existingCanvas = document.getElementById("game-canvas");
    if (existingCanvas) {
        existingCanvas.remove();
    }
    
    // Remove existing back button if it exists
    const existingButton = document.getElementById("back-to-menu-btn");
    if (existingButton) {
        existingButton.remove();
    }
    
    // Get game container dimensions to match the canvas size
    const gameContainer = document.getElementById("game-container");
    if (gameContainer) {
        CANVAS_WIDTH = gameContainer.offsetWidth;
        CANVAS_HEIGHT = gameContainer.offsetHeight;
    }
    
    // Calculate the proper number of rows and columns based on canvas dimensions
    MAZE_ROWS = Math.ceil(CANVAS_HEIGHT / CELL_SIZE);
    MAZE_COLS = Math.ceil(CANVAS_WIDTH / CELL_SIZE);
    
    ctx = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT, "game-canvas");
    
    // Add back button
    const backButton = document.createElement("button");
    backButton.id = "back-to-menu-btn";
    backButton.title = "Back to Menu";
    backButton.addEventListener("click", exitGame);
    gameContainer.appendChild(backButton);
    
    canvasInitialized = true;
}

/**
 * Reset the game state for a new level
 */
function resetGameState() {
    
    // Stop eventual enemy sound
    stopEnemySound();

    // Reset game state variables
    levelState.reset();
    
    // Set player position first (important for maze generation)
    player.reset();
    
    // Generate new maze after player is positioned
    generateMaze(MAZE_ROWS, MAZE_COLS);

    // Lights 
    introVisible = true;
    introTimer = 0;
    
    // Reset points timer for consistent point reduction
    pointsTimer = 0;

    // Time to accomplish level
    gameState.timeLeft = LEVEL_START_TIME;

    // Level 2 : holes
    if (typeof holes !== 'undefined') {
        holes.length = 0;
    }

    if (gameState.currentLevel >= 2) {
        placeHoles(MAZE_ROWS, MAZE_COLS);
    }
    
    // Level 3 : ennemy
    if (typeof enemy !== 'undefined') {
        enemy.x = -100;
        enemy.y = -100;
        enemy.haloActive = false;
        enemy.haloTimer = 0;
    }

    if (gameState.currentLevel  >= 3) {
    placeEnemy();
    
        if (gameState.currentLevel === 3 || gameState.currentLevel === 4) {
            startEnemySound();
        } else {
            stopEnemySound();
        }

    enemy.haloActive = false;
        enemy.haloTimer = 0;
    }

    // Level 4: battery 
    if (gameState.currentLevel >= 4) {
        player.torchEnergy = TORCH_INITIAL_ENERGY;
        placeBatteries(MAZE_ROWS, MAZE_COLS);
    }

    // Level 5: time loosing
    if (gameState.currentLevel >= 5) {
        placeTimeLosers(MAZE_ROWS, MAZE_COLS);
    }

    // Reset game running flag
    isGameRunning = true;
}

/**
 * Place enemy in a valid position (away from player)
 */
function placeEnemy() {
    // Initialize enemy with context
    if (typeof initEnemy === 'function') {
        initEnemy(ctx);
    } else {
        // Simple placement for now - far corner
        enemy.x = CANVAS_WIDTH - 128;
        enemy.y = CANVAS_HEIGHT - 128;
    }
}

/**
 * Initialize the game
 */
function initGame() {
    // (Re)create the canvas
    initCanvas();
    
    // Only reset points when starting a new game, not between levels
    if (gameState.currentLevel === 1) {
        gameState.points = DEFAULT_POINTS; // Reset points using constant
    }
    
    // Reset game state
    resetGameState();
    
    // Start the game loop
    lastTimestamp = 0;
    requestAnimationFrame(gameLoop);
}

// Function to deal with time 
function handleTimeEnd() {
    if (gameState.lives > 1) {
      gameState.lives--;
      resetGameState();
    } else {
      // Game over - reset everything including points
      gameState.currentLevel = 1;
      gameState.lives = MAX_LIVES;
      gameState.points = DEFAULT_POINTS; // Reset points using constant
      gameState.isGameOver = true;
      showGameOver();
      return;
    }
 
    resetGameState();
    lastTimestamp = 0;
    requestAnimationFrame(gameLoop);
}

/**
 * Main game loop using requestAnimationFrame
 * @param {number} timestamp - Current timestamp from requestAnimationFrame
 */
function gameLoop(timestamp) {
    if (!isGameRunning) return;

    // Calcul du delta time
    const deltaTime = lastTimestamp === 0 ? 0 : (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    if (deltaTime > 0) {
        update(deltaTime, ctx);
        render(ctx);

        if (gameState.isGameOver) {
          showGameOver();
          return;
      }

        if (introVisible) {
            // Tant qu’on est en intro, on affiche 5→1
            introTimer += deltaTime;
            const remaining = Math.ceil(5 - introTimer);

            ctx.fillStyle    = "white";
            ctx.font         = "72px Arial";
            ctx.textAlign    = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(
              remaining,
              ctx.canvas.width  / 2,
              ctx.canvas.height / 2
            );

            if (introTimer >= 5) {
                introVisible = false;
                // No sound when intro is on
                if (typeof checkAndStartEnemySound === 'function') {
                    checkAndStartEnemySound(false);
                }
            }
        }
        else {
            // Points reduction - 1 point per second
            pointsTimer += deltaTime;
            if (pointsTimer >= 1) {
                // Only reduce points if we have any left
                if (gameState.points > 0) {
                    gameState.points--;
                }
                pointsTimer = 0; // Reset the timer but keep the fraction
            }
            
            // Dès que introVisible est false, on décrémente le timer
            gameState.timeLeft -= deltaTime;
            if (gameState.timeLeft <= 0) {
                handleTimeEnd();
                return;
            }

            // On vérifie la fin de niveau
            if (levelState.completed) {
                showLevelComplete();
                return;
            }
        }
    }

    // On boucle
    requestAnimationFrame(gameLoop);
}


/**
 * Display level complete overlay
 */
function showLevelComplete() {
    if (gameState.currentLevel >= 5) {
        saveScore(gameState.points);
        showGameComplete();
        return;
    }

    // Create semi-transparent overlay
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Draw completion message
    ctx.font = "36px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(`Level ${gameState.currentLevel } completed!`, ctx.canvas.width / 2, ctx.canvas.height / 2);
    
    // Add continue prompt
    ctx.font = "24px Arial";
    ctx.fillText("Press any key to continue", ctx.canvas.width / 2, ctx.canvas.height / 2 + 40);
    
    isGameRunning = false;
}

/**
 * Exit the game and return to the menu
 */
export function exitGame() {
    isGameRunning = false;
    stopEnemySound();

    // Reset game state to level 1 when exiting
    gameState.currentLevel = 1;
    gameState.lives = MAX_LIVES;
    gameState.points = DEFAULT_POINTS;
    
    // Just clean up without destroying the objects
    const canvas = document.getElementById("game-canvas");
    if (canvas) canvas.remove();
    
    const backButton = document.getElementById("back-to-menu-btn");
    if (backButton) backButton.remove();
    
    // Reset flag to ensure canvas will be recreated on next start
    canvasInitialized = false;
    
    // Show menu again
    const menu = document.getElementById("main-menu");
    if (menu) menu.style.display = "flex";
    
    document.body.classList.remove("game-active");
}

/**
 * Start the game when assets are ready
 */
export function startGame() {
    if (areImagesReady()) {
        initGame();
    } else {
        // Wait for images to load
        setTimeout(() => {
            startGame();
        }, 100);
    }
}

// Event handler for restarting after level completion
document.addEventListener("keydown", function() {
    if (!isGameRunning && levelState.completed) {
  
      if (gameState.currentLevel >= 5) {
        saveScore(gameState.points);
  
        gameState.currentLevel = 1;
        gameState.lives = MAX_LIVES;
        gameState.points = DEFAULT_POINTS;
      } else {
        gameState.currentLevel++;
      }
  
      resetGameState();
      requestAnimationFrame(gameLoop);
    }
    else if (!isGameRunning && gameState.isGameOver) {
      // Reset everything for a new game
      gameState.currentLevel = 1;
      gameState.lives = MAX_LIVES;
      gameState.points = DEFAULT_POINTS;
      gameState.isGameOver = false; // Reset game over state
      
      resetGameState();
      requestAnimationFrame(gameLoop);
  }
  });
  

export { resetGameState };

// Final game
/**
 * Display game completion screen with user stats
 */
function showGameComplete() {
  isGameRunning = false;
  stopEnemySound();

  // Create a full-screen overlay container
  const overlay = document.createElement("div");
  overlay.id = "game-complete-overlay";
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.85)";
  overlay.style.display = "flex";
  overlay.style.flexDirection = "column";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";
  overlay.style.zIndex = "1000";
  overlay.style.padding = "20px";
  overlay.style.color = "white";
  overlay.style.fontFamily = "Arial, sans-serif";

  // Get user data
  const username = localStorage.getItem("username") || "Unknown";
  const avatarSrc = localStorage.getItem("profileImage") || "ressources/images/maquettes/defaultpicture.png";
  const score = gameState.points;
  
  // Create content container
  const content = document.createElement("div");
  content.style.backgroundColor = "rgba(50, 50, 50, 0.8)";
  content.style.borderRadius = "10px";
  content.style.padding = "30px";
  content.style.maxWidth = "600px";
  content.style.width = "100%";
  content.style.textAlign = "center";
  content.style.boxShadow = "0 0 20px rgba(255, 255, 150, 0.5)";

  // Create title
  const title = document.createElement("h1");
  title.textContent = "CONGRATULATIONS!";
  title.style.color = "#FFD700";
  title.style.marginBottom = "20px";
  title.style.fontSize = "36px";

  // Create message
  const message = document.createElement("p");
  message.textContent = "You have completed all 5 levels of the maze!";
  message.style.fontSize = "18px";
  message.style.marginBottom = "30px";

  // Create profile section
  const profile = document.createElement("div");
  profile.style.display = "flex";
  profile.style.alignItems = "center";
  profile.style.justifyContent = "center";
  profile.style.marginBottom = "20px";

  // Add avatar
  const avatar = document.createElement("img");
  avatar.src = avatarSrc;
  avatar.style.width = "80px";
  avatar.style.height = "80px";
  avatar.style.borderRadius = "50%";
  avatar.style.marginRight = "20px";
  avatar.style.border = "3px solid #FFD700";

  // Add user info
  const userInfo = document.createElement("div");
  userInfo.style.textAlign = "left";

  const usernamePara = document.createElement("h2");
  usernamePara.textContent = username;
  usernamePara.style.margin = "0 0 10px 0";
  usernamePara.style.color = "#FFD700";

  const scorePara = document.createElement("p");
  scorePara.innerHTML = `<strong>Your Score:</strong> ${score} points`;
  scorePara.style.margin = "0 0 5px 0";
  scorePara.style.fontSize = "18px";

  // Add location section (will be filled later)
  const locationPara = document.createElement("p");
  locationPara.innerHTML = `<strong>Your Location:</strong> <span id="user-location">Retrieving...</span>`;
  locationPara.style.margin = "0";

  userInfo.appendChild(usernamePara);
  userInfo.appendChild(scorePara);
  userInfo.appendChild(locationPara);
  profile.appendChild(avatar);
  profile.appendChild(userInfo);

  // Create leaderboard section
  const leaderboardSection = document.createElement("div");
  leaderboardSection.style.marginTop = "30px";
  leaderboardSection.style.width = "100%";
  
  const leaderboardTitle = document.createElement("h3");
  leaderboardTitle.textContent = "Leaderboard";
  leaderboardTitle.style.borderBottom = "2px solid #FFD700";
  leaderboardTitle.style.paddingBottom = "10px";
  leaderboardTitle.style.marginBottom = "15px";
  
  const leaderboardList = document.createElement("ul");
  leaderboardList.id = "completion-leaderboard";
  leaderboardList.style.listStyle = "none";
  leaderboardList.style.padding = "0";
  leaderboardList.style.margin = "0";
  leaderboardList.style.maxHeight = "200px";
  leaderboardList.style.overflowY = "auto";
  
  leaderboardSection.appendChild(leaderboardTitle);
  leaderboardSection.appendChild(leaderboardList);

  // Add buttons
  const buttonContainer = document.createElement("div");
  buttonContainer.style.display = "flex";
  buttonContainer.style.justifyContent = "center";
  buttonContainer.style.gap = "15px";
  buttonContainer.style.marginTop = "30px";

  const playAgainBtn = document.createElement("button");
  playAgainBtn.textContent = "Play Again";
  playAgainBtn.style.padding = "10px 20px";
  playAgainBtn.style.fontSize = "16px";
  playAgainBtn.style.backgroundColor = "#4CAF50";
  playAgainBtn.style.color = "white";
  playAgainBtn.style.border = "none";
  playAgainBtn.style.borderRadius = "5px";
  playAgainBtn.style.cursor = "pointer";
  playAgainBtn.style.fontWeight = "bold";

  const menuBtn = document.createElement("button");
  menuBtn.textContent = "Back to Menu";
  menuBtn.style.padding = "10px 20px";
  menuBtn.style.fontSize = "16px";
  menuBtn.style.backgroundColor = "#3498DB";
  menuBtn.style.color = "white";
  menuBtn.style.border = "none";
  menuBtn.style.borderRadius = "5px";
  menuBtn.style.cursor = "pointer";
  menuBtn.style.fontWeight = "bold";

  buttonContainer.appendChild(playAgainBtn);
  buttonContainer.appendChild(menuBtn);

  // Build the content hierarchy
  content.appendChild(title);
  content.appendChild(message);
  content.appendChild(profile);
  content.appendChild(leaderboardSection);
  content.appendChild(buttonContainer);
  overlay.appendChild(content);

  // Add to document
  document.body.appendChild(overlay);

  // Populate leaderboard
  updateCompletionLeaderboard(score, username);

  // Get location
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        document.getElementById("user-location").textContent = 
          `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
      },
      (error) => {
        document.getElementById("user-location").textContent = "Location unavailable";
      }
    );
  } else {
    document.getElementById("user-location").textContent = "Geolocation not supported";
  }

  // Add button event listeners
  playAgainBtn.addEventListener("click", () => {
    document.body.removeChild(overlay);
    gameState.currentLevel = 1;
    gameState.lives = MAX_LIVES;
    gameState.points = DEFAULT_POINTS;

    resetGameState();
    requestAnimationFrame(gameLoop);
  });

  menuBtn.addEventListener("click", () => {
    document.body.removeChild(overlay);
    exitGame();
  });
}

/**
 * Update the completion leaderboard and highlight the player's position
 * @param {number} currentScore - The player's current score
 * @param {string} currentUsername - The current player's username
 */
function updateCompletionLeaderboard(currentScore, currentUsername) {
  const leaderboardList = document.getElementById("completion-leaderboard");
  if (!leaderboardList) return;

  // Get current leaderboard
  let scores = JSON.parse(localStorage.getItem("leaderboard") || "[]");
  
  // Sort scores
  scores.sort((a, b) => b.score - a.score);
  
  // Find player's position in leaderboard
  const playerPosition = scores.findIndex(entry => 
    entry.username === currentUsername && entry.score === currentScore);
  
  // Clear leaderboard list
  leaderboardList.innerHTML = "";
  
  // Create entries
  if (scores.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No scores yet.";
    leaderboardList.appendChild(li);
  } else {
    scores.slice(0, 10).forEach((entry, index) => {
      const li = document.createElement("li");
      li.style.padding = "8px 5px";
      li.style.borderBottom = "1px solid rgba(255,255,255,0.1)";
      li.style.display = "flex";
      li.style.alignItems = "center";
      
      // Highlight current player's entry
      if (index === playerPosition) {
        li.style.backgroundColor = "rgba(255, 215, 0, 0.3)";
        li.style.borderRadius = "5px";
        li.style.fontWeight = "bold";
      }
      
      // Add rank
      const rank = document.createElement("span");
      rank.textContent = `#${index + 1}`;
      rank.style.marginRight = "10px";
      rank.style.fontWeight = "bold";
      rank.style.minWidth = "30px";
      
      // Add player image and name
      const playerInfo = document.createElement("div");
      playerInfo.style.display = "flex";
      playerInfo.style.alignItems = "center";
      playerInfo.style.flex = "1";
      
      const img = document.createElement("img");
      img.src = entry.image;
      img.style.width = "25px";
      img.style.height = "25px";
      img.style.borderRadius = "50%";
      img.style.marginRight = "10px";
      
      const name = document.createElement("span");
      name.textContent = entry.username;
      
      // Add score
      const score = document.createElement("span");
      score.textContent = `${entry.score} pts`;
      score.style.marginLeft = "auto";
      
      playerInfo.appendChild(img);
      playerInfo.appendChild(name);
      
      li.appendChild(rank);
      li.appendChild(playerInfo);
      li.appendChild(score);
      
      leaderboardList.appendChild(li);
    });
  }
}

/**
 * Display game over screen
 */
function showGameOver() {
  // Create semi-transparent overlay
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  // Draw game over message
  ctx.font = "48px Arial";
  ctx.fillStyle = "red";
  ctx.textAlign = "center";
  ctx.fillText("GAME OVER", ctx.canvas.width / 2, ctx.canvas.height / 2 - 30);
  
  // Add restart prompt
  ctx.font = "24px Arial";
  ctx.fillText("Press any key to restart", ctx.canvas.width / 2, ctx.canvas.height / 2 + 70);
  
  isGameRunning = false;
  gameState.isGameOver = true;
}