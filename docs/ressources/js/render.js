import { images } from "./image.js";
import { player } from "./player.js";
import { enemy } from "./enemy.js";
import { canvasWidth, canvasHeight } from "./canvas.js";
import { gameState } from "./main.js";
import { introVisible } from "./main.js";
import { TORCH_INITIAL_ENERGY, TORCH_MIN_ENERGY } from "./constants.js";
import { batteries } from "./battery.js";
import { timeLosers } from "./timeLosing.js";

export let maze = []; // Store the maze layout
export let exit = { x: 0, y: 0 }; // Store the exit position
export let holes = [];
export let pathToExit = []; // store the direct path from player to exit


const CELL_SIZE = 64;
const WALL_PROBABILITY = 0.3; // 30% chance for wall placement

/**
 * Generates a random maze with paths and an exit
 * @param {number} rows - Number of rows in the maze
 * @param {number} cols - Number of columns in the maze
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 */
export function generateMaze(rows, cols) {
    // Initialize empty maze
    maze = Array(rows).fill().map(() => Array(cols).fill(false));
    
    // Calculate player's cell position
    const playerCellX = Math.floor(player.x / CELL_SIZE);
    const playerCellY = Math.floor(player.y / CELL_SIZE);
    
    // Add walls randomly
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            // Skip wall generation for player's position and surrounding cells
            if (Math.abs(row - playerCellY) <= 1 && Math.abs(col - playerCellX) <= 1) {
                maze[row][col] = false; // Ensure no walls near player
            } else {
                maze[row][col] = Math.random() < WALL_PROBABILITY;
            }
        }
    }
    
    // Place exit away from player
    placeExit(rows, cols);
    
    // Create path from player to exit
    const exitCellX = Math.floor(exit.x / CELL_SIZE);
    const exitCellY = Math.floor(exit.y / CELL_SIZE);
    
    createPath(playerCellX, playerCellY, exitCellX, exitCellY, rows, cols);
    
    // Final safety check: clear walls at player position
    ensurePlayerSafeZone(playerCellX, playerCellY);
}

/**
 * Ensures that player's starting area is clear of walls
 * @param {number} playerCellX - Player X cell position
 * @param {number} playerCellY - Player Y cell position
 */
function ensurePlayerSafeZone(playerCellX, playerCellY) {
    // Clear a 3x3 area around player's starting position
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            const ny = playerCellY + dy;
            const nx = playerCellX + dx;
            
            if (ny >= 0 && ny < maze.length && nx >= 0 && nx < maze[0].length) {
                maze[ny][nx] = false; // Ensure no walls
            }
        }
    }
}

/**
 * Places an exit in the maze far from the player
 * @param {number} rows - Number of rows in the maze
 * @param {number} cols - Number of columns in the maze
 */
function placeExit(rows, cols) {
    const minDistance = Math.floor(Math.max(rows, cols) / 2);
    const playerCellX = Math.floor(player.x / CELL_SIZE);
    const playerCellY = Math.floor(player.y / CELL_SIZE);
    
    // Define the maximum position for the door to be fully visible
    const maxDoorPositionX = canvasWidth - CELL_SIZE;
    const maxDoorPositionY = canvasHeight - CELL_SIZE;
    const maxCellPosX = Math.floor(maxDoorPositionX / CELL_SIZE);
    const maxCellPosY = Math.floor(maxDoorPositionY / CELL_SIZE);
    
    let validExitFound = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 100;
    
    while (!validExitFound && attempts < MAX_ATTEMPTS) {
        attempts++;
        
        // Pick a position far from the player that is within canvas bounds
        const exitCellX = Math.floor(Math.random() * maxCellPosX);
        const exitCellY = Math.floor(Math.random() * maxCellPosY);
        
        // Calculate distance from player
        const distance = Math.sqrt(
            Math.pow(exitCellX - playerCellX, 2) + 
            Math.pow(exitCellY - playerCellY, 2)
        );
        
        // Calculate exit position in pixels
        const exitPixelX = exitCellX * CELL_SIZE;
        const exitPixelY = exitCellY * CELL_SIZE;
        
        // Verify exit is valid
        if (distance >= minDistance && 
            exitPixelX < maxDoorPositionX && 
            exitPixelY < maxDoorPositionY) {
            
            // Clear the exit cell and surrounding cells
            maze[exitCellY][exitCellX] = false;
            
            // Clear adjacent cells
            const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
            for (const [dy, dx] of directions) {
                const ny = exitCellY + dy;
                const nx = exitCellX + dx;
                if (ny >= 0 && ny < rows && nx >= 0 && nx < cols) {
                    maze[ny][nx] = false; // Clear adjacent cell
                }
            }
            
            // Save exit position in pixels
            exit.x = exitPixelX;
            exit.y = exitPixelY;
            validExitFound = true;
        }
    }
    
    // Fallback if no valid exit is found
    if (!validExitFound) {
        const farCornerX = (cols - 1) * CELL_SIZE;
        const farCornerY = (rows - 1) * CELL_SIZE;
        exit.x = farCornerX;
        exit.y = farCornerY;
        
        // Clear the area around the exit
        const exitCellX = Math.floor(farCornerX / CELL_SIZE);
        const exitCellY = Math.floor(farCornerY / CELL_SIZE);
        if (exitCellY < rows && exitCellX < cols) {
            maze[exitCellY][exitCellX] = false;
        }
    }
}

/**
 * Creates a path between two points in the maze
 * @param {number} startX - Starting X cell coordinate
 * @param {number} startY - Starting Y cell coordinate
 * @param {number} endX - Ending X cell coordinate
 * @param {number} endY - Ending Y cell coordinate
 * @param {number} rows - Total rows in maze
 * @param {number} cols - Total columns in maze
 */
function createPath(startX, startY, endX, endY, rows, cols) {
    let currentX = startX;
    let currentY = startY;
    pathToExit = []; // clear previous path
    
    while (currentX !== endX || currentY !== endY) {

        // store each cell
        pathToExit.push({ x: currentX, y: currentY });

        // Determine which direction to move (horizontal or vertical)
        const moveHorizontally = Math.random() > 0.5;
        
        if (moveHorizontally && currentX !== endX) {
            currentX += currentX < endX ? 1 : -1;
        } else if (currentY !== endY) {
            currentY += currentY < endY ? 1 : -1;
        } else if (currentX !== endX) {
            currentX += currentX < endX ? 1 : -1;
        }
        
        // Ensure we're within bounds
        if (currentY >= 0 && currentY < rows && currentX >= 0 && currentX < cols) {
            maze[currentY][currentX] = false; // Clear the cell
        }
    }

    // Add the last cell
    pathToExit.push({ x: endX, y: endY });
}

/**
 * Renders the maze walls
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 */
export function renderMaze(ctx) {
    if (!images.wall.ready) return;
    
    // Only render walls that are in the viewport
    for (let row = 0; row < maze.length; row++) {
        for (let col = 0; col < maze[row].length; col++) {
            if (maze[row][col]) {
                ctx.drawImage(images.wall.img, col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            }
        }
    }
}

/**
 * Main render function to draw all game elements
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 */
export function render(ctx) {

    // Draw the background of the game (ground texture)
    if (images.bg.ready) ctx.drawImage(images.bg.img, 0, 0);

    if (introVisible) {
        renderMaze(ctx); // Render maze in intro mode
    }
    
    // Render the exit/door
    if (images.door.ready) {
        // Draw door
        ctx.drawImage(images.door.img, exit.x, exit.y, CELL_SIZE, CELL_SIZE);
        
        // Add light effect for the door during intro only
        if (introVisible) {
            const doorCenterX = exit.x + CELL_SIZE/2;
            const doorCenterY = exit.y + CELL_SIZE/2;
            
            // Calculate a simple pulse effect
            const pulse = 0.8 + Math.sin(Date.now() / 200) * 0.3;
            const haloSize = CELL_SIZE * pulse;
            
            // Create and draw the light halo
            ctx.save();
            const gradient = ctx.createRadialGradient(
                doorCenterX, doorCenterY, 0,
                doorCenterX, doorCenterY, haloSize
            );
            gradient.addColorStop(0, 'rgba(255, 255, 150, 0.7)');
            gradient.addColorStop(0.4, 'rgba(255, 200, 100, 0.3)');
            gradient.addColorStop(1, 'rgba(255, 150, 50, 0)');
            
            ctx.globalCompositeOperation = 'lighter';
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(doorCenterX, doorCenterY, haloSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    // Draw holes (if any)
    if (gameState.currentLevel >= 2 && images.hole.ready) {
        holes.forEach(h => {
        ctx.drawImage(images.hole.img, h.x, h.y, CELL_SIZE, CELL_SIZE);
        });
    }

    // Render player
    if (images.player.ready) ctx.drawImage(images.player.img, player.x, player.y, CELL_SIZE, CELL_SIZE);

    // Render enemy
    if (images.enemy.ready) ctx.drawImage(images.enemy.img, enemy.x, enemy.y, CELL_SIZE, CELL_SIZE);

    // Render batteries (if any)
    if (gameState.currentLevel >= 4 && images.battery && images.battery.ready) {
        batteries.forEach(battery => {
            if (!battery.collected) {
                ctx.drawImage(images.battery.img, battery.x, battery.y, CELL_SIZE, CELL_SIZE);
            }
        });
    }

    // Render time losers (if any)
    if (gameState.currentLevel >= 5 && images.timeLosing && images.timeLosing.ready) {
        timeLosers.forEach(timeLosing => {
            if (!timeLosing.activated) {
                ctx.drawImage(images.timeLosing.img, timeLosing.x, timeLosing.y, CELL_SIZE, CELL_SIZE);
            }
        });
    }


    // If intro is over, apply the flashlight effect
    if (!introVisible) {
        let lightLength = 150;
        if (gameState.currentLevel >= 4) {
            // Scale light radius with energy percentage
            const energyPercentage = player.torchEnergy / TORCH_INITIAL_ENERGY;
            lightLength = 150 * Math.max(energyPercentage, TORCH_MIN_ENERGY / TORCH_INITIAL_ENERGY);
        }
        const coneAngle = Math.PI / 3;
        const cx = player.x + player.size / 2;
        const cy = player.y + player.size / 2;
        const dirAngle = Math.atan2(player.direction.y, player.direction.x);

        // Create an offscreen canvas for the light effect
        const offscreenCanvas = document.createElement("canvas");
        offscreenCanvas.width = canvasWidth;
        offscreenCanvas.height = canvasHeight;
        const offCtx = offscreenCanvas.getContext("2d");
    
        // Clear the offscreen canvas
        if (images.bg.ready) offCtx.drawImage(images.bg.img, 0, 0);
        
        // Draw the maze on the offscreen canvas
        renderMaze(offCtx);

        // Draw the door on the offscreen canvas
        if (images.door.ready) {
        offCtx.drawImage(images.door.img, exit.x, exit.y, CELL_SIZE, CELL_SIZE);
        }
        
        // Draw the holes on the offscreen canvas
        if (gameState.currentLevel >= 2 && images.hole.ready) {
            holes.forEach(h => {
                offCtx.drawImage(images.hole.img, h.x, h.y, CELL_SIZE, CELL_SIZE);
            });
        }

         // Draw the batteries on the offscreen canvas 
         if (gameState.currentLevel >= 4 && images.battery && images.battery.ready) {
            batteries.forEach(battery => {
                if (!battery.collected) {
                    offCtx.drawImage(images.battery.img, battery.x, battery.y, CELL_SIZE, CELL_SIZE);
                }
            });
        }

        // Draw the time losers on the offscreen canvas 
        if (gameState.currentLevel >= 5 && images.timeLosing && images.timeLosing.ready) {
            timeLosers.forEach(timeLosing => {
                if (!timeLosing.activated) {
                    offCtx.drawImage(images.timeLosing.img, timeLosing.x, timeLosing.y, CELL_SIZE, CELL_SIZE);
                }
            });
        }

        // Draw the light effect
        offCtx.globalCompositeOperation = "destination-in";
        offCtx.fillStyle = "white";
        offCtx.beginPath();
        offCtx.moveTo(cx, cy);
        offCtx.arc(cx, cy, lightLength, dirAngle - coneAngle / 2, dirAngle + coneAngle / 2);
        offCtx.closePath();
        offCtx.fill();
    
        // Fill the main canvas with full black
        ctx.fillStyle = "rgba(0,0,0,1)";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
        // Draw the offscreen canvas on the main canvas
        ctx.drawImage(offscreenCanvas, 0, 0);

        if (gameState.currentLevel >= 3 && images.enemy.ready && enemy.haloActive) {
            // Sauvegarder le contexte actuel
            ctx.save();
            
            // Calculer le centre exact de l'ennemi
            const enemyCenterX = enemy.x + CELL_SIZE/2;
            const enemyCenterY = enemy.y + CELL_SIZE/2;
            
            // Créer un halo lumineux
            const haloSize = CELL_SIZE * 2; // Taille du halo (plus grand que l'ennemi)
            
            // Définir un gradient radial pour le halo centré sur l'ennemi
            const gradient = ctx.createRadialGradient(
                enemyCenterX, enemyCenterY, 0,
                enemyCenterX, enemyCenterY, haloSize/2
            );
            
            // Couleurs du gradient
            gradient.addColorStop(0, 'rgba(255, 255, 150, 0.8)');
            gradient.addColorStop(0.5, 'rgba(255, 200, 100, 0.5)');
            gradient.addColorStop(1, 'rgba(255, 150, 50, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(enemyCenterX, enemyCenterY, haloSize/2, 0, Math.PI * 2);
            ctx.fill();
            
            // Restaurer le contexte
            ctx.restore();
            
            // Dessiner l'ennemi uniquement quand le halo est actif
            ctx.drawImage(images.enemy.img, enemy.x, enemy.y, CELL_SIZE, CELL_SIZE);
        }
    }
    

    // Draw the HUD
    const barW = 400, barH = 24, barX = (canvasWidth - barW) / 2, barY = 8;
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = "black";
    ctx.font = "16px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    const padding = 8;
    const time = Math.ceil(gameState.timeLeft);
    const points = gameState.points;
    const text = `Level: ${gameState.currentLevel}   Time: ${time}s   Points: ${points}   Lives:`;
    const textX = barX + padding;
    const textY = barY + barH / 2;

    ctx.fillText(text, textX, textY);

    // Draw the lives indicator
    const heartSize = barH - 4;
    const spacing = heartSize + 4;
    let x = barX + barW - spacing;
    const y = barY + 2;
    if (images.heart.ready) {
        for (let i = 0; i < gameState.lives; i++) {
            ctx.drawImage(images.heart.img, x - i * spacing, y, heartSize, heartSize);
        }
    }

    // Draw the player character
    if (images.player.ready) ctx.drawImage(images.player.img, player.x, player.y, CELL_SIZE, CELL_SIZE);
}

