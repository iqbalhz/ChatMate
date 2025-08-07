/**
 * Configuration file for WhatsApp QRIS Bot
 */
const config = {
    // WhatsApp Configuration
    whatsapp: {
        sessionPath: './whatsapp-session',
        puppeteerOptions: {
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process',
                '--disable-gpu'
            ]
        }
    },

    // QRIS Configuration
    qris: {
        // Merchant information - these should be configured based on actual merchant details
        merchantAccount: process.env.QRIS_MERCHANT_ACCOUNT || 'ID.CO.EXAMPLE.WWW',
        merchantName: process.env.QRIS_MERCHANT_NAME || 'TOKO EXAMPLE',
        merchantCity: process.env.QRIS_MERCHANT_CITY || 'JAKARTA',
        countryCode: process.env.QRIS_COUNTRY_CODE || 'ID',
        currencyCode: process.env.QRIS_CURRENCY_CODE || '360', // Indonesian Rupiah
        
        // QR Code generation settings
        qrCodeOptions: {
            type: 'png',
            quality: 0.92,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            },
            width: 512,
            errorCorrectionLevel: 'M'
        }
    },

    // Payment Configuration
    payment: {
        minAmount: parseInt(process.env.MIN_PAYMENT_AMOUNT) || 1000,        // Rp 1,000
        maxAmount: parseInt(process.env.MAX_PAYMENT_AMOUNT) || 10000000,    // Rp 10,000,000
        currency: 'IDR',
        supportedCommands: ['bayar', 'payment', 'pay']
    },

    // Logging Configuration
    logging: {
        level: process.env.LOG_LEVEL || 'INFO',
        enableConsole: process.env.ENABLE_CONSOLE_LOGGING !== 'false',
        logToFile: process.env.LOG_TO_FILE === 'true',
        logFilePath: process.env.LOG_FILE_PATH || './logs/bot.log'
    },

    // Rate Limiting Configuration
    rateLimiting: {
        enabled: process.env.RATE_LIMITING_ENABLED !== 'false',
        maxRequestsPerMinute: parseInt(process.env.MAX_REQUESTS_PER_MINUTE) || 10,
        maxRequestsPerHour: parseInt(process.env.MAX_REQUESTS_PER_HOUR) || 60
    },

    // Security Configuration
    security: {
        enableSanitization: process.env.ENABLE_INPUT_SANITIZATION !== 'false',
        maxMessageLength: parseInt(process.env.MAX_MESSAGE_LENGTH) || 1000,
        allowedFileTypes: ['image/png', 'image/jpeg'],
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 // 5MB
    },

    // Bot Configuration
    bot: {
        name: process.env.BOT_NAME || 'QRIS Payment Bot',
        version: '1.0.0',
        description: 'WhatsApp bot for generating QRIS payment QR codes',
        responseTimeout: parseInt(process.env.RESPONSE_TIMEOUT) || 30000, // 30 seconds
        enableGroupMessages: process.env.ENABLE_GROUP_MESSAGES === 'true',
        enableStatusMessages: process.env.ENABLE_STATUS_MESSAGES === 'true'
    },

    // Development Configuration
    development: {
        isDevelopment: process.env.NODE_ENV !== 'production',
        enableDebugLogs: process.env.ENABLE_DEBUG_LOGS === 'true',
        mockQrisGeneration: process.env.MOCK_QRIS_GENERATION === 'true'
    }
};

// Validate critical configuration
function validateConfig() {
    const errors = [];

    // Validate payment amounts
    if (config.payment.minAmount >= config.payment.maxAmount) {
        errors.push('Minimum payment amount must be less than maximum payment amount');
    }

    // Validate QRIS currency code
    if (!['360', 'IDR'].includes(config.qris.currencyCode)) {
        errors.push('Invalid currency code for Indonesian Rupiah');
    }

    // Validate merchant account format
    if (!config.qris.merchantAccount || config.qris.merchantAccount.length < 5) {
        errors.push('Merchant account must be specified and at least 5 characters long');
    }

    if (errors.length > 0) {
        console.error('Configuration validation errors:');
        errors.forEach(error => console.error(`  - ${error}`));
        throw new Error('Invalid configuration');
    }
}

// Validate configuration on module load
try {
    validateConfig();
} catch (error) {
    console.error('Configuration validation failed:', error.message);
    process.exit(1);
}

module.exports = config;
