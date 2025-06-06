/**
 * Load an image asynchronously
 * @param {string} src - Image source URL
 * @returns {Promise<HTMLImageElement>} - Promise that resolves with the loaded image
 */
export function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
        img.src = src;
    });
}

// Game images with metadata
export const images = {
    bg: { 
        src: "ressources/images/maquettes/base.png", 
        ready: false, 
        img: null 
    },
    player: { 
        src: "ressources/images/maquettes/personnage.png", 
        ready: false, 
        img: null 
    },
    enemy: { 
        src: "ressources/images/maquettes/ennemy.png", 
        ready: false, 
        img: null 
    },
    wall: { 
        src: "ressources/images/maquettes/wall.png", 
        ready: false, 
        img: null 
    },
    door: { 
        src: "ressources/images/maquettes/door.png", 
        ready: false, 
        img: null 
    },
    heart: { 
        src: "ressources/images/maquettes/heart.png", 
        ready: false, 
        img: null 
    },
    hole: { 
        src: "ressources/images/maquettes/hole.png", 
        ready: false, 
        img: null 
    },
    battery: { 
        src: "ressources/images/maquettes/battery.png", 
        ready: false, 
        img: null 
    },
    timeLosing: { 
        src: "ressources/images/maquettes/timeLosing.png", 
        ready: false, 
        img: null 
    }  
};

// Load all images
Object.values(images).forEach(image => {
    loadImage(image.src)
        .then(img => {
            image.img = img;
            image.ready = true;
        })
        .catch(error => {
            console.error(error);
        });
});

/**
 * Check if all images are loaded and ready to use
 * @returns {boolean} - True if all images are ready
 */
export function areImagesReady() {
    return Object.values(images).every(image => image.ready);
}

/**
 * Preloads all images and returns a promise that resolves when all are loaded
 * @returns {Promise<void>} - Promise that resolves when all images are loaded
 */
export function preloadAllImages() {
    const promises = Object.values(images).map(image => 
        loadImage(image.src).then(img => {
            image.img = img;
            image.ready = true;
        })
    );
    
    return Promise.all(promises);
}
