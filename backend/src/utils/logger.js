/**
 * Logger utility for conditional logging based on environment
 * In production, only errors and warnings are logged
 * In development, all logs are shown
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
    /**
     * Log informational messages (only in development)
     */
    info: (...args) => {
        if (isDevelopment) {
            console.log(...args);
        }
    },

    /**
     * Log debug messages (only in development)
     */
    debug: (...args) => {
        if (isDevelopment) {
            console.debug(...args);
        }
    },

    /**
     * Log warnings (always logged)
     */
    warn: (...args) => {
        console.warn(...args);
    },

    /**
     * Log errors (always logged)
     */
    error: (...args) => {
        console.error(...args);
    },

    /**
     * Log with emoji prefix for better visibility (only in development)
     */
    emoji: (emoji, ...args) => {
        if (isDevelopment) {
            console.log(emoji, ...args);
        }
    },
};

export default logger;
