import { maze, exit, holes } from "./render.js";
import { player } from "./player.js";
import { CELL_SIZE } from "./canvas.js";
import { pathToExit } from "./render.js";

export function placeHoles(rows, cols, max = 8) {
    holes.length = 0; // clear old holes

    let attempts = 0;

    while (holes.length < max && attempts < 50) {
        attempts++;

        const col = Math.floor(Math.random() * cols);
        const row = Math.floor(Math.random() * rows);

        const px = col * CELL_SIZE;
        const py = row * CELL_SIZE;

        const onPathToExit = pathToExit.some(cell => cell.x === col && cell.y === row);
        const distanceToPlayer = Math.hypot(px - player.x, py - player.y);
        const inWall = maze[row]?.[col];
        const tooCloseToPlayer = distanceToPlayer < 128;
        const alreadyPlaced = holes.some(h => h.x === px && h.y === py);

        if (!inWall && !tooCloseToPlayer && !alreadyPlaced && !onPathToExit) {
            holes.push({ x: px, y: py });
        }
    }
}
