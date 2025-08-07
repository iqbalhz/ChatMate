/**
 * Simple logger utility for the WhatsApp QRIS bot
 */
class Logger {
    constructor() {
        this.levels = {
            ERROR: 0,
            WARN: 1,
            INFO: 2,
            DEBUG: 3
        };
        
        // Get log level from environment variable, default to INFO
        this.currentLevel = this.levels[process.env.LOG_LEVEL] || this.levels.INFO;
    }

    formatMessage(level, message, ...args) {
        const timestamp = new Date().toISOString();
        const formattedArgs = args.length > 0 ? ` ${args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ')}` : '';
        
        return `[${timestamp}] [${level}] ${message}${formattedArgs}`;
    }

    error(message, ...args) {
        if (this.currentLevel >= this.levels.ERROR) {
            console.error(this.formatMessage('ERROR', message, ...args));
        }
    }

    warn(message, ...args) {
        if (this.currentLevel >= this.levels.WARN) {
            console.warn(this.formatMessage('WARN', message, ...args));
        }
    }

    info(message, ...args) {
        if (this.currentLevel >= this.levels.INFO) {
            console.log(this.formatMessage('INFO', message, ...args));
        }
    }

    debug(message, ...args) {
        if (this.currentLevel >= this.levels.DEBUG) {
            console.log(this.formatMessage('DEBUG', message, ...args));
        }
    }

    // Alias methods for convenience
    log(message, ...args) {
        this.info(message, ...args);
    }

    // Method to change log level at runtime
    setLevel(level) {
        const upperLevel = level.toUpperCase();
        if (this.levels.hasOwnProperty(upperLevel)) {
            this.currentLevel = this.levels[upperLevel];
            this.info(`Log level changed to: ${upperLevel}`);
        } else {
            this.warn(`Invalid log level: ${level}. Valid levels are: ${Object.keys(this.levels).join(', ')}`);
        }
    }

    // Method to get current log level
    getLevel() {
        const levelNames = Object.keys(this.levels);
        return levelNames.find(name => this.levels[name] === this.currentLevel) || 'UNKNOWN';
    }
}

// Export a singleton instance
module.exports = new Logger();
