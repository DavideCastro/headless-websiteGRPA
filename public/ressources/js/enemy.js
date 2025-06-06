import { player } from "./player.js";
import { images } from "./image.js";

//TO DO : 
// add light popup with sound but only around the ghost (see later when light is implemented)
// add colision detection with the player (see later when levels are implemented)


// Comments:
// - At the moment, fixed size in pixels for the enemy is used (64x64) in the movement patterns --> not working with variable (therefore import images.js is not used)
//   See later if the size of the enemy can be changed dynamically when size of canvas is decided
// - When size of the game is fixed, check patternZigzagVertical for when hitting left upper corner

// Implemented:
// - Patterns of movement: zigzag vertical, zigzag horizontal, diagonal bounce + random choice of the pattern
// - Random position of the enemy on the canvas, at least 150 pixels away from the player
// - Sound of the ghost (looping) with random delay between 5 and 15 seconds

const ghostSound = new Audio("ressources/sounds/ghostSigh.wav");
ghostSound.volume = 0.5;
let ghostSoundTimeout = null;


export const enemy = {
    //Default values
    x: 0,
    y: 0,
    speed: 80,
    direction: { x: 1, y: 1 },
    pattern: null,
    getNextDirection: null,
    haloActive: false,
    haloTimer: 0,
    haloMaxTime: 6
};

// Patterns of movement
function patternZigzagVertical(ctx) {
    return () => {
        let dir = { ...enemy.direction };

        const enemyWidth = 64; 
        const enemyHeight = 64; 


        // For vertical zigzag: Always move horizontally, but when hitting 
        // left/right boundaries reverse horizontal AND vertical direction
        if (enemy.x <= 0 || enemy.x >= ctx.canvas.width - enemyWidth) {
            dir.x *= -1;
            dir.y *= -1; // Change vertical direction when hitting sides

            dir.y = dir.y > 0 ? 2 : -2;
        }

        // Reverse horizontal direction only when hitting left/right edges
        if (enemy.y <= 0 || enemy.y >= ctx.canvas.height - enemyHeight) {
            dir.y *= -1;

            dir.y = dir.y > 0 ? 2 : -2;
        }

        dir.x = dir.x > 0 ? 1 : -1;

        return dir;
    };
}

function patternZigzagHorizontal(ctx) {
    return () => {
        let dir = { ...enemy.direction };

        const enemyWidth = 64;
        const enemyHeight = 64;

        // Change horizontal direction when hitting top/bottom
        if (enemy.y <= 0 || enemy.y >= ctx.canvas.height - enemyHeight) {
            dir.y *= -1;
            dir.x *= -1; 

            // Increase horizontal component for more pronounced zigzags
            dir.x = dir.x > 0 ? 2 : -2;
        }
        // Only reverse horizontal when hitting sides
        if (enemy.x <= 0 || enemy.x >= ctx.canvas.width - enemyWidth) {
            dir.x *= -1;

             // Always keep a stronger horizontal direction after a bounce
             dir.x = dir.x > 0 ? 2 : -2;
        }

        // Always keep a lower vertical component than horizontal
        dir.y = dir.y > 0 ? 1 : -1;

        return dir;
    };
}

function patternDiagonalBounce(ctx) {
    return () => {
        let dir = { ...enemy.direction };

        const enemyWidth = 64;
        const enemyHeight = 64;

        // Simple diagonal bounce: just reverse the appropriate direction
        // when hitting any boundary, maintaining diagonal movement
        if (enemy.x <= 0 || enemy.x >= ctx.canvas.width - enemyWidth) {
            dir.x *= -1;

            // Ensure diagonal speed is balanced
            dir.x = dir.x > 0 ? 1.5 : -1.5;
        }
        if (enemy.y <= 0 || enemy.y >= ctx.canvas.height - enemyHeight) {
            dir.y *= -1;

            // Ensure diagonal speed is balanced
            dir.y = dir.y > 0 ? 1.5 : -1.5;
        }

        // Ensure movement remains diagonal by restoring direction if one component is zero
        if (dir.x === 0) dir.x = enemy.x < ctx.canvas.width / 2 ? 1.5 : -1.5;
        if (dir.y === 0) dir.y = enemy.y < ctx.canvas.height / 2 ? 1.5 : -1.5;

        return dir;
    };
}

// creation of the array of movement patterns
let patterns = [];

// function to play the ghost sound in a loop with random delay between 5 and 15 seconds
function playGhostSoundLoop() {
    const delay = Math.random() * 10000 + 5000; // entre 5 et 15 secondes
    ghostSoundTimeout = setTimeout(() => {
        if (enemySoundActive) { // Seulement si l'ennemi doit faire du son
            ghostSound.play();
            enemy.haloActive = true;
            enemy.haloTimer = 0;
            playGhostSoundLoop(); // relance la boucle
        }
    }, delay);
}

export let enemySoundActive = false;

export function startEnemySound() {
    enemySoundActive = true;
    playGhostSoundLoop();
}

export function stopEnemySound() {
    enemySoundActive = false;
    clearTimeout(ghostSoundTimeout);
}


export function initEnemy(ctx) {
    // add patterns to the array with ctx as parameter
    patterns = [
        patternZigzagVertical(ctx),
        patternZigzagHorizontal(ctx),
        patternDiagonalBounce(ctx)
    ];

    // variable to check the enemy position
    let safe = false;
    // loop to find a safe position for the enemy
    while (!safe) {
        // generate random position for the enemy within canvas
        enemy.x = Math.floor(Math.random() * (ctx.canvas.width - 64));
        enemy.y = Math.floor(Math.random() * (ctx.canvas.height - 64));
        // calculate distance between player and enemy
        const dx = enemy.x - player.x;
        const dy = enemy.y - player.y;
        // calculate distance using pythagorean theorem
        const distance = Math.sqrt(dx * dx + dy * dy);
        // check if distance is greater than 150 pixels
        if (distance > 150) safe = true;
    }

    // choose a random pattern from the array
    const pick = Math.floor(Math.random() * patterns.length);
    // save the enemy pattern for debug
    enemy.pattern = pick;
    // set the enemy initial direction
    enemy.direction = { x: 1, y: 1 };     
    // set the movement pattern function
    enemy.getNextDirection = patterns[pick];  
}



