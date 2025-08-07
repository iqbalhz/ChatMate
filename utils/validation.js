const logger = require('./logger');
const { messageTemplates } = require('../config/messages');

/**
 * Parse payment command from message text
 */
function parsePaymentCommand(messageText) {
    try {
        const trimmed = messageText.toLowerCase().trim();
        
        // Check if message starts with 'bayar'
        if (!trimmed.startsWith('bayar')) {
            return null;
        }

        // Extract the amount part
        const parts = trimmed.split(/\s+/);
        if (parts.length !== 2) {
            return null; // Invalid format
        }

        const amountStr = parts[1];
        
        // Check if amount contains only digits
        if (!/^\d+$/.test(amountStr)) {
            return null;
        }

        const amount = parseInt(amountStr, 10);
        
        return {
            command: 'bayar',
            amount: amount,
            originalText: messageText
        };

    } catch (error) {
        logger.error('Error parsing payment command:', error);
        return null;
    }
}

/**
 * Validate payment amount
 */
function validateAmount(amount) {
    const MIN_AMOUNT = 1000;        // Rp 1,000
    const MAX_AMOUNT = 10000000;    // Rp 10,000,000

    try {
        // Check if amount is a number
        if (typeof amount !== 'number' || isNaN(amount)) {
            return {
                isValid: false,
                error: messageTemplates.validation.invalidNumber
            };
        }

        // Check if amount is an integer
        if (!Number.isInteger(amount)) {
            return {
                isValid: false,
                error: messageTemplates.validation.invalidInteger
            };
        }

        // Check minimum amount
        if (amount < MIN_AMOUNT) {
            return {
                isValid: false,
                error: messageTemplates.validation.belowMinimum(MIN_AMOUNT)
            };
        }

        // Check maximum amount
        if (amount > MAX_AMOUNT) {
            return {
                isValid: false,
                error: messageTemplates.validation.aboveMaximum(MAX_AMOUNT)
            };
        }

        logger.info(`Amount validation successful: Rp ${amount.toLocaleString('id-ID')}`);
        return {
            isValid: true,
            amount: amount
        };

    } catch (error) {
        logger.error('Error validating amount:', error);
        return {
            isValid: false,
            error: messageTemplates.validation.validationError
        };
    }
}

/**
 * Validate Indonesian phone number format
 */
function validatePhoneNumber(phoneNumber) {
    try {
        // Remove all non-digit characters
        const cleaned = phoneNumber.replace(/\D/g, '');
        
        // Check Indonesian mobile number patterns
        const indonesianPattern = /^(62|0)(8[1-9][0-9]{6,9})$/;
        
        return {
            isValid: indonesianPattern.test(cleaned),
            cleanedNumber: cleaned
        };

    } catch (error) {
        logger.error('Error validating phone number:', error);
        return {
            isValid: false,
            cleanedNumber: null
        };
    }
}

/**
 * Sanitize text input to prevent injection attacks
 */
function sanitizeInput(input) {
    try {
        if (typeof input !== 'string') {
            return '';
        }

        return input
            .trim()
            .replace(/[<>]/g, '') // Remove potential HTML tags
            .substring(0, 1000); // Limit length to prevent abuse

    } catch (error) {
        logger.error('Error sanitizing input:', error);
        return '';
    }
}

/**
 * Validate currency code
 */
function validateCurrencyCode(code) {
    const validCodes = ['360', 'IDR']; // Indonesian Rupiah codes
    return validCodes.includes(code);
}

/**
 * Format amount to Indonesian Rupiah string
 */
function formatCurrency(amount) {
    try {
        if (typeof amount !== 'number' || isNaN(amount)) {
            return 'Rp 0';
        }

        return `Rp ${amount.toLocaleString('id-ID')}`;

    } catch (error) {
        logger.error('Error formatting currency:', error);
        return 'Rp 0';
    }
}

module.exports = {
    parsePaymentCommand,
    validateAmount,
    validatePhoneNumber,
    sanitizeInput,
    validateCurrencyCode,
    formatCurrency
};
