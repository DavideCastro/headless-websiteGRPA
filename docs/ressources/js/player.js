/**
 * Player object with position and movement properties
 */
import { TORCH_INITIAL_ENERGY } from "./constants.js";

export const player = {
    x: 0,
    y: 0,
    speed: 256,
    size: 48,
    direction: { x: 0, y: -1 }, //default direction is up for the light effect
    torchEnergy: 100,

    /**
     * Reset player to starting position
     * @param {number} x - Optional starting X coordinate
     * @param {number} y - Optional starting Y coordinate
     */
    reset(x = 0, y = 0) {
        this.x = x;
        this.y = y;
        this.torchEnergy = TORCH_INITIAL_ENERGY; 
    }
};
