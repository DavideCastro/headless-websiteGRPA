import { maze, pathToExit, holes } from "./render.js";
import { player } from "./player.js";
import { CELL_SIZE } from "./canvas.js";
import { MAX_TIME_LOSERS, TIME_LOSS_SECONDS } from "./constants.js";

// Store time loser positions
export let timeLosers = [];

/**
 * Place time losers randomly in the maze
 * @param {number} rows - Number of rows in the maze
 * @param {number} cols - Number of columns in the maze
 * @param {number} max - Maximum number of time losers to place
 */
export function placeTimeLosers(rows, cols, max = MAX_TIME_LOSERS) {
    timeLosers.length = 0; // clear old time losers
    
    let attempts = 0;
    
    while (timeLosers.length < max && attempts < 50) {
        attempts++;
        
        const col = Math.floor(Math.random() * cols);
        const row = Math.floor(Math.random() * rows);
        
        const px = col * CELL_SIZE;
        const py = row * CELL_SIZE;
        
        // Check if this position is valid
        const onPathToExit = pathToExit.some(cell => cell.x === col && cell.y === row);
        const distanceToPlayer = Math.hypot(px - player.x, py - player.y);
        const inWall = maze[row]?.[col];
        const tooCloseToPlayer = distanceToPlayer < 128;
        const alreadyPlaced = timeLosers.some(t => t.x === px && t.y === py);
        
        // Check if the position overlaps with a hole
        const onHole = holes.some(h => h.x === px && h.y === py);
        
        // Place time loser if position is valid
        if (!inWall && !tooCloseToPlayer && !alreadyPlaced && !onPathToExit && !onHole) {
            timeLosers.push({ 
                x: px, 
                y: py, 
                activated: false 
            });
        }
    }
}