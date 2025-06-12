/**
 * Class for securing and validating usernames
 */
class UsernameSecurity {
    // Configuration
    static MAX_LENGTH = 50;
    static MIN_LENGTH = 1;


    static sanitizeAndValidate(username) {
        // Check if it's a string
        if (!username || typeof username !== 'string') {
            throw new Error('Username must be a string');
        }

        // Remove leading and trailing spaces
        let cleaned = username.trim();

        // Remove HTML tags completely
        cleaned = cleaned.replace(/<[^>]*>/g, '');

        // Remove potentially dangerous characters
        cleaned = cleaned.replace(/[<>'"&]/g, '');

        // Remove control characters and invisible characters
        cleaned = cleaned.replace(/[\x00-\x1F\x7F-\x9F]/g, '');

        // Replace multiple spaces with single space
        cleaned = cleaned.replace(/\s+/g, ' ');

        // Trim again after cleaning
        cleaned = cleaned.trim();

        // Check length after cleaning
        if (cleaned.length === 0) {
            throw new Error('Username cannot be empty after cleaning');
        }

        if (cleaned.length < this.MIN_LENGTH) {
            throw new Error(`Username must contain at least ${this.MIN_LENGTH} character`);
        }

        if (cleaned.length > this.MAX_LENGTH) {
            throw new Error(`Username cannot exceed ${this.MAX_LENGTH} characters`);
        }

        // Check that it only contains acceptable characters
        const allowedPattern = /^[a-zA-Z0-9À-ÿ\s\-_\.]+$/;
        if (!allowedPattern.test(cleaned)) {
            throw new Error('Username contains unauthorized characters. Only letters, numbers, spaces, hyphens and underscores are allowed');
        }

        return cleaned;
    }

    static sanitizeOrFallback(username, fallback = 'User') {
        try {
            return this.sanitizeAndValidate(username);
        } catch (error) {
            console.warn('Invalid username, using fallback value:', error.message);
            return fallback;
        }
    }

    static isValid(username) {
        try {
            this.sanitizeAndValidate(username);
            return true;
        } catch (error) {
            return false;
        }
    }

    static preview(username) {
        try {
            const cleaned = this.sanitizeAndValidate(username);
            return {
                isValid: true,
                cleaned: cleaned,
                message: 'Valid username',
                changed: username !== cleaned
            };
        } catch (error) {
            return {
                isValid: false,
                cleaned: null,
                message: error.message,
                changed: false
            };
        }
    }
}

export { UsernameSecurity };