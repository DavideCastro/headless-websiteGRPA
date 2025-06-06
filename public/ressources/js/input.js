/**
 * Object to track currently pressed keys
 */
export const keysDown = {};

// Maps for input key handling
const MOVEMENT_KEYS = [
    "arrowup", "arrowdown", "arrowleft", "arrowright", 
    "w", "a", "s", "d"
];

/**
 * Handle keydown events
 * @param {KeyboardEvent} e - The keyboard event
 */
function handleKeyDown(e) {
    const key = e.key.toLowerCase();
    
    // Prevent default behavior for movement keys to avoid page scrolling
    if (MOVEMENT_KEYS.includes(key)) {
        e.preventDefault();
        keysDown[key] = true;
    }
}

/**
 * Handle keyup events
 * @param {KeyboardEvent} e - The keyboard event
 */
function handleKeyUp(e) {
    const key = e.key.toLowerCase();
    delete keysDown[key];
}

// Add event listeners
window.addEventListener("keydown", handleKeyDown);
window.addEventListener("keyup", handleKeyUp);

/**
 * Remove event listeners (useful for cleanup)
 */
export function removeInputListeners() {
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);
}
