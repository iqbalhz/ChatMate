const QRCode = require('qrcode');
const logger = require('../utils/logger');
const config = require('../config/config');

class QrisService {
    constructor() {
        this.merchantAccount = config.qris.merchantAccount;
        this.merchantName = config.qris.merchantName;
        this.merchantCity = config.qris.merchantCity;
        this.countryCode = config.qris.countryCode;
        this.currencyCode = config.qris.currencyCode;
    }

    /**
     * Generate QRIS payload according to EMV specifications
     * This creates a simplified QRIS format for demonstration
     */
    generateQrisPayload(amount) {
        try {
            // QRIS follows EMV QR Code Specification
            // This is a simplified implementation for demonstration
            
            // Format version indicator (ID 00)
            const formatIndicator = this.formatTLV('00', '01');
            
            // Point of initiation method (ID 01)
            const pointOfInitiation = this.formatTLV('01', '12'); // 12 = dynamic QR
            
            // Merchant account information (ID 26-51 range)
            // Using ID 26 for demonstration
            const merchantAccountInfo = this.formatTLV('26', this.merchantAccount);
            
            // Merchant category code (ID 52)
            const merchantCategoryCode = this.formatTLV('52', '0000');
            
            // Transaction currency (ID 53) - 360 = Indonesian Rupiah
            const transactionCurrency = this.formatTLV('53', this.currencyCode);
            
            // Transaction amount (ID 54)
            const transactionAmount = this.formatTLV('54', amount.toString());
            
            // Country code (ID 58)
            const countryCode = this.formatTLV('58', this.countryCode);
            
            // Merchant name (ID 59)
            const merchantName = this.formatTLV('59', this.merchantName);
            
            // Merchant city (ID 60)
            const merchantCity = this.formatTLV('60', this.merchantCity);
            
            // Additional data field template (ID 62)
            // Reference label for transaction tracking
            const referenceLabel = this.formatTLV('05', `TXN${Date.now()}`);
            const additionalData = this.formatTLV('62', referenceLabel);
            
            // Combine all fields (without CRC yet)
            const qrData = formatIndicator + 
                          pointOfInitiation + 
                          merchantAccountInfo + 
                          merchantCategoryCode + 
                          transactionCurrency + 
                          transactionAmount + 
                          countryCode + 
                          merchantName + 
                          merchantCity + 
                          additionalData;
            
            // Calculate CRC (ID 63) - simplified implementation
            const crcValue = this.calculateCRC16(qrData + '6304');
            const crc = this.formatTLV('63', crcValue);
            
            const finalQrisPayload = qrData + crc;
            
            logger.info(`Generated QRIS payload for amount: Rp ${amount.toLocaleString('id-ID')}`);
            return finalQrisPayload;
            
        } catch (error) {
            logger.error('Error generating QRIS payload:', error);
            throw error;
        }
    }

    /**
     * Format Tag-Length-Value (TLV) according to EMV specification
     */
    formatTLV(tag, value) {
        const length = value.length.toString().padStart(2, '0');
        return tag + length + value;
    }

    /**
     * Calculate CRC16 checksum for QRIS
     * This is a simplified implementation
     */
    calculateCRC16(data) {
        // Simplified CRC16 calculation for demonstration
        // In production, use a proper CRC16-CCITT implementation
        let crc = 0xFFFF;
        const polynomial = 0x1021;
        
        for (let i = 0; i < data.length; i++) {
            crc ^= (data.charCodeAt(i) << 8);
            
            for (let j = 0; j < 8; j++) {
                if (crc & 0x8000) {
                    crc = (crc << 1) ^ polynomial;
                } else {
                    crc <<= 1;
                }
                crc &= 0xFFFF;
            }
        }
        
        return crc.toString(16).toUpperCase().padStart(4, '0');
    }

    /**
     * Generate QR code image from QRIS payload
     */
    async generateQRCode(qrisData) {
        try {
            const options = {
                type: 'png',
                quality: 0.92,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                },
                width: 512,
                errorCorrectionLevel: 'M'
            };

            const qrCodeBuffer = await QRCode.toBuffer(qrisData, options);
            logger.info('QR code generated successfully');
            return qrCodeBuffer;
            
        } catch (error) {
            logger.error('Error generating QR code:', error);
            throw error;
        }
    }

    /**
     * Validate QRIS payload format
     */
    validateQrisPayload(payload) {
        try {
            // Basic validation checks
            if (!payload || payload.length < 50) {
                return { isValid: false, error: 'Invalid QRIS payload length' };
            }

            // Check format indicator (should start with 0002)
            if (!payload.startsWith('000201')) {
                return { isValid: false, error: 'Invalid format indicator' };
            }

            // Check if CRC is present (last 8 characters should be CRC)
            if (payload.length < 8 || !payload.substring(payload.length - 8, payload.length - 4).startsWith('63')) {
                return { isValid: false, error: 'Missing or invalid CRC' };
            }

            logger.info('QRIS payload validation successful');
            return { isValid: true };

        } catch (error) {
            logger.error('Error validating QRIS payload:', error);
            return { isValid: false, error: 'Validation error occurred' };
        }
    }
}

module.exports = QrisService;
