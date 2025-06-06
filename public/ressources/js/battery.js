import { maze, pathToExit, holes } from "./render.js";
import { player } from "./player.js";
import { CELL_SIZE } from "./canvas.js";
import { BATTERY_BOOST, MAX_BATTERIES } from "./constants.js";

// Store battery positions
export let batteries = [];

/**
 * Place batteries randomly in the maze
 * @param {number} rows - Number of rows in the maze
 * @param {number} cols - Number of columns in the maze
 * @param {number} max - Maximum number of batteries to place
 */
export function placeBatteries(rows, cols, max = MAX_BATTERIES) {
    batteries.length = 0; // clear old batteries
    
    let attempts = 0;
    
    while (batteries.length < max && attempts < 50) {
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
        const alreadyPlaced = batteries.some(b => b.x === px && b.y === py);
        
        // Check if the position overlaps with a hole
        const onHole = holes.some(h => h.x === px && h.y === py);
        
        // Place battery if position is valid
        if (!inWall && !tooCloseToPlayer && !alreadyPlaced && !onPathToExit && !onHole) {
            batteries.push({ 
                x: px, 
                y: py, 
                collected: false 
            });
        }
    }
}