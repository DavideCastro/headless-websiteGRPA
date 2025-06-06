/**
 * Game constants
 * All configurable values should be defined here for easy maintenance
 */

// Game settings
export const DEFAULT_POINTS = 1000; // Starting points for the player
export const LEVEL_START_TIME = 30; // Time to complete each level
export const MAX_LIVES = 3; // Starting number of lives

// Cell sizing 
export const CELL_SIZE = 64; // Size of each cell in pixels
export const PLAYER_SIZE = 48; // Size of the player sprite

// Enemy settings
export const ENEMY_SPEED = 80; // Base enemy movement speed
export const ENEMY_HALO_MAX_TIME = 6; // How long the enemy halo stays active

// Battery settings
export const BATTERY_BOOST = 25; // How much energy a battery adds (%)
export const MAX_BATTERIES = 5; // Maximum number of batteries per level
export const BATTERY_SOUND_VOLUME = 0.3; // Volume for battery pickup sound

// Torch settings
export const TORCH_INITIAL_ENERGY = 100; // Starting torch energy (%)
export const TORCH_MIN_ENERGY = 20; // Minimum torch energy (%)
export const TORCH_DRAIN_RATE = {
    LEVEL1: 0, 
    LEVEL2: 0, 
    LEVEL3: 0, 
    LEVEL4: 3,
    LEVEL5: 4 
};

// Time Loser settings
export const TIME_LOSS_SECONDS = 3; // How many seconds to deduct when player touches time loser
export const MAX_TIME_LOSERS = 7; // Maximum number of time losers per level
