import { player } from "./player.js";
import { keysDown } from "./input.js";
import { maze, exit } from "./render.js";
import { enemy } from "./enemy.js";
import { gameState, resetGameState } from "./main.js";
import { introVisible } from "./main.js"; 
import { holes } from "./render.js";
import { CELL_SIZE } from "./canvas.js";
import { DEFAULT_POINTS, TORCH_INITIAL_ENERGY, TORCH_MIN_ENERGY, TORCH_DRAIN_RATE, BATTERY_BOOST, TIME_LOSS_SECONDS  } from "./constants.js";
import { batteries } from "./battery.js";
import { timeLosers } from "./timeLosing.js";


// Global flag to ensure safe clearance logic runs only once at start.
let playerSafeCleared = false;

// Game state with proper getter/setter
export const levelState = {
  _completed: false,
  get completed() {
    return this._completed;
  },
  set completed(value) {
    this._completed = Boolean(value);
  },
  reset() {
    this._completed = false;
  }
};

// For backward compatibility
export const levelCompleted = levelState.completed;

/**
 * Check if player collides with walls
 * @param {number} x - Player x position
 * @param {number} y - Player y position
 * @param {Array} maze - 2D maze array
 * @param {number} cellSize - Size of maze cells
 * @param {number} playerSize - Size of player
 * @returns {boolean} - True if collision detected
 */
function collidesWithWall(x, y, maze, cellSize, playerSize) {
    const collisionMargin = {
        left: 10,
        top: 10,
        right: 0,
        bottom: 0
    };

    // Calculate collision box
    const bounds = {
        left: Math.floor((x + collisionMargin.left) / cellSize),
        top: Math.floor((y + collisionMargin.top) / cellSize),
        right: Math.ceil((x + playerSize - collisionMargin.right) / cellSize) - 1,
        bottom: Math.ceil((y + playerSize - collisionMargin.bottom) / cellSize) - 1
    };
    
    // Check if any boundary is outside the maze
    if (bounds.left < 0 || bounds.right >= maze[0].length || 
        bounds.top < 0 || bounds.bottom >= maze.length) {
        return true;
    }
    
    // Check each corner for wall collision
    if (maze[bounds.top][bounds.left] || 
        maze[bounds.top][bounds.right] || 
        maze[bounds.bottom][bounds.left] || 
        maze[bounds.bottom][bounds.right]) {
        return true;
    }
    
    // Check intermediate cells if player spans multiple cells
    for (let i = bounds.left + 1; i < bounds.right; i++) {
        if (maze[bounds.top][i] || maze[bounds.bottom][i]) return true;
    }
    
    for (let i = bounds.top + 1; i < bounds.bottom; i++) {
        if (maze[i][bounds.left] || maze[i][bounds.right]) return true;
    }
    
    return false;
}

/**
 * Check if player has reached the exit
 * @returns {boolean} - True if player reached exit
 */
function checkExitCollision() {
    const playerSize = 48;
    const exitSize = 64;
    
    // Check for rectangle overlap (AABB collision)
    return player.x < exit.x + exitSize && 
           player.x + playerSize > exit.x && 
           player.y < exit.y + exitSize && 
           player.y + playerSize > exit.y;
}

// Player collision with enemy
function checkEnemyCollision() {
    const playerSize = 48;
    const enemySize = 64;

    return player.x < enemy.x + enemySize &&
           player.x + playerSize > enemy.x &&
           player.y < enemy.y + enemySize &&
           player.y + playerSize > enemy.y;
}


/**
 * Main update function for game logic
 * @param {number} modifier - Time delta since last update
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 */
export function update(modifier, ctx) {
    const cellSize = 64;
    const playerSize = 48;

    // Don't move player if intro is visible
    if (introVisible) {
        return; 
    }

    // Check if player reached exit
    if (checkExitCollision()) {
        levelState.completed = true;
        return;
    }

    let newX = player.x;
    let newY = player.y;
    let moved = false;

     // Calculate potential movement and update direction
     if (keysDown["arrowup"] || keysDown["w"]) {
        newY -= player.speed * modifier;
        player.direction = { x: 0, y: -1 };
        moved = true;
    }
    if (keysDown["arrowdown"] || keysDown["s"]) {
        newY += player.speed * modifier;
        player.direction = { x: 0, y: 1 };
        moved = true;
    }
    if (keysDown["arrowleft"] || keysDown["a"]) {
        newX -= player.speed * modifier;
        player.direction = { x: -1, y: 0 };
        moved = true;
    }
    if (keysDown["arrowright"] || keysDown["d"]) {
        newX += player.speed * modifier;
        player.direction = { x: 1, y: 0 };
        moved = true;
    }
    
    // Diagonal movement - update direction accordingly
    if ((keysDown["arrowup"] || keysDown["w"]) && (keysDown["arrowleft"] || keysDown["a"])) {
        player.direction = { x: -0.7071, y: -0.7071 }; // Normalized diagonal direction
    }
    if ((keysDown["arrowup"] || keysDown["w"]) && (keysDown["arrowright"] || keysDown["d"])) {
        player.direction = { x: 0.7071, y: -0.7071 };
    }
    if ((keysDown["arrowdown"] || keysDown["s"]) && (keysDown["arrowleft"] || keysDown["a"])) {
        player.direction = { x: -0.7071, y: 0.7071 };
    }
    if ((keysDown["arrowdown"] || keysDown["s"]) && (keysDown["arrowright"] || keysDown["d"])) {
        player.direction = { x: 0.7071, y: 0.7071 };
    }
    

    // Try moving horizontally and vertically independently for wall sliding
    const canMoveX = !collidesWithWall(newX, player.y, maze, cellSize, playerSize);
    const canMoveY = !collidesWithWall(player.x, newY, maze, cellSize, playerSize);
    
    // Apply movement with wall sliding effect
    if (canMoveX) player.x = newX;
    if (canMoveY) player.y = newY;
    
    // Try diagonal movement if both directions are blocked but diagonal path is clear
    if (!canMoveX && !canMoveY && !collidesWithWall(newX, newY, maze, cellSize, playerSize)) {
        player.x = newX;
        player.y = newY;
    }

    // Keep player within canvas bounds
    player.x = Math.max(0, Math.min(ctx.canvas.width - playerSize, player.x));
    player.y = Math.max(0, Math.min(ctx.canvas.height - playerSize, player.y));

    // Enemy movement
    if (gameState.currentLevel >= 3 && enemy.getNextDirection) {
    // Get the next direction based on the current pattern and position
    const newDir = enemy.getNextDirection();
    // Update the direction
    enemy.direction = newDir;
    
    // Move the enemy based on its direction and speed
    enemy.x += enemy.direction.x * enemy.speed * modifier;
    enemy.y += enemy.direction.y * enemy.speed * modifier;

    if (enemy.haloActive) {
        enemy.haloTimer += modifier;
        if (enemy.haloTimer >= enemy.haloMaxTime) {
            enemy.haloActive = false;
        }
    }
}

    if (gameState.currentLevel >= 2) {
        const playerSize = 48;
            for (let hole of holes) {
                if (
                player.x < hole.x + CELL_SIZE &&
                player.x + playerSize > hole.x &&
                player.y < hole.y + CELL_SIZE &&
                player.y + playerSize > hole.y
                ){
                    if (gameState.lives > 1) {
                        gameState.lives--;
                        resetGameState();
                    } else {
                        gameState.currentLevel = 1;
                        gameState.lives = 3;
                        gameState.points = DEFAULT_POINTS; // Using constant
                        resetGameState();
                        gameState.isGameOver = true;
                        return;
                    }
                    return;
            }
        }
    }
    
    if (!levelState.completed && gameState.currentLevel >= 3 && checkEnemyCollision()) {
        if (gameState.lives > 1) {
            gameState.lives--;
            resetGameState();
        } else {
            gameState.currentLevel = 1;
            gameState.lives = 3;
            gameState.points = DEFAULT_POINTS; // Using constant
            resetGameState();
            gameState.isGameOver = true;
                return;
        }
        return;
    }

    if (gameState.currentLevel >= 4) {  
        const drainRate = TORCH_DRAIN_RATE.LEVEL4;
        player.torchEnergy = Math.max(TORCH_MIN_ENERGY, player.torchEnergy - drainRate * modifier);

        if (batteries && batteries.length > 0) {
            batteries.forEach(battery => {
                if (!battery.collected) {
                    const batterySize = CELL_SIZE;
                    
                    // Check collision
                    if (player.x < battery.x + batterySize &&
                        player.x + player.size > battery.x &&
                        player.y < battery.y + batterySize &&
                        player.y + player.size > battery.y) {
                            
                        // Collect battery
                        battery.collected = true;
                        
                        // Boost energy (capped at max)
                        player.torchEnergy = Math.min(TORCH_INITIAL_ENERGY, 
                                                    player.torchEnergy + BATTERY_BOOST);
                        
                        // Play sound if available
                        if (window.batterySound) {
                            batterySound.play();
                        }
                    }
                }
            });
        }
    }

    if (gameState.currentLevel >= 5) {
        if (timeLosers && timeLosers.length > 0) {
            timeLosers.forEach(timeLosing => {
                if (!timeLosing.activated) {
                    const timeLosingSIze = CELL_SIZE;
                    
                    // Check collision
                    if (player.x < timeLosing.x + timeLosingSIze &&
                        player.x + player.size > timeLosing.x &&
                        player.y < timeLosing.y + timeLosingSIze &&
                        player.y + player.size > timeLosing.y) {
                            
                        // Activate time loser (remove from game)
                        timeLosing.activated = true;
                        
                        // Reduce time left
                        gameState.timeLeft = Math.max(1, gameState.timeLeft - TIME_LOSS_SECONDS);
                        
                        // Play sound if available
                        if (window.timeLosierSound) {
                            timeLosierSound.play();
                        }
                    }
                }
            });
        }
    }
}
