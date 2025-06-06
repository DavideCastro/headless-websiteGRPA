// Store canvas dimensions for other modules to access
export let canvasWidth = 512;
export let canvasHeight = 512;
export const CELL_SIZE = 64;


/**
 * Creates a canvas element and appends it to the DOM
 * @param {number} width - Canvas width in pixels
 * @param {number} height - Canvas height in pixels
 * @param {string} id - Optional ID for the canvas element
 * @param {HTMLElement} container - Optional container to append canvas to (defaults to game-container)
 * @returns {CanvasRenderingContext2D} - The 2D rendering context
 */
export function createCanvas(width = 512, height = 512, id = null, container = null) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    
    if (id) canvas.id = id;
    
    // Update exported dimensions
    canvasWidth = width;
    canvasHeight = height;
    
    // Append to specified container or game-container
    const target = container || document.getElementById("game-container");
    target.appendChild(canvas);
    
    return canvas.getContext("2d");
  }

