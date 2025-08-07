const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const QRCode = require('qrcode');
const { execSync } = require('child_process');
const WhatsAppService = require('./services/whatsapp');
const QrisService = require('./services/qris');
const { validateAmount, parsePaymentCommand } = require('./utils/validation');
const logger = require('./utils/logger');
const config = require('./config/config');
const { formatPaymentMessage } = require('./config/messages');

class WhatsAppBot {
    constructor() {
        // Try to find chromium executable path dynamically
        let chromiumPath = null;
        try {
            chromiumPath = execSync('which chromium', { encoding: 'utf8' }).trim();
        } catch (error) {
            logger.warn('Could not find chromium with which command, using bundled version');
        }

        this.client = new Client({
            authStrategy: new LocalAuth(),
            puppeteer: chromiumPath ? {
                headless: true,
                executablePath: chromiumPath,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--disable-background-timer-throttling',
                    '--disable-backgrounding-occluded-windows',
                    '--disable-renderer-backgrounding',
                    '--disable-features=TranslateUI',
                    '--disable-ipc-flooding-protection',
                    '--no-first-run',
                    '--disable-gpu',
                    '--disable-extensions',
                    '--disable-default-apps',
                    '--no-default-browser-check',
                    '--disable-web-security'
                ]
            } : {
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--disable-gpu'
                ]
            }
        });
        
        this.whatsappService = new WhatsAppService(this.client);
        this.qrisService = new QrisService();
        
        this.setupEventHandlers();
    }

    setupEventHandlers() {
        this.client.on('qr', (qr) => {
            logger.info('QR RECEIVED, scan with your phone to log in');
            QRCode.toString(qr, { type: 'terminal' }, (err, url) => {
                if (err) {
                    logger.error('Error generating QR code for terminal:', err);
                    return;
                }
                console.log(url);
            });
        });

        this.client.on('ready', () => {
            logger.info('WhatsApp bot is ready!');
        });

        this.client.on('message', async (message) => {
            try {
                await this.handleMessage(message);
            } catch (error) {
                logger.error('Error handling message:', error);
                await this.whatsappService.sendErrorMessage(message.from, 'Terjadi kesalahan dalam memproses pesan Anda.');
            }
        });

        this.client.on('disconnected', (reason) => {
            logger.warn('Client was logged out:', reason);
        });

        this.client.on('auth_failure', (msg) => {
            logger.error('Authentication failure:', msg);
        });
    }

    async handleMessage(message) {
        // Skip group messages and status updates
        if (message.from.includes('@g.us') || message.from === 'status@broadcast') {
            return;
        }

        const messageBody = message.body.toLowerCase().trim();
        logger.info(`Received message from ${message.from}: ${messageBody}`);

        // Check if it's a payment command
        const paymentCommand = parsePaymentCommand(messageBody);
        if (!paymentCommand) {
            // Send help message for unknown commands that start with 'bayar'
            if (messageBody.startsWith('bayar')) {
                await this.whatsappService.sendHelpMessage(message.from);
            }
            return;
        }

        const { amount } = paymentCommand;

        // Validate amount
        const validation = validateAmount(amount);
        if (!validation.isValid) {
            await this.whatsappService.sendMessage(message.from, validation.error);
            return;
        }

        // Generate QRIS QR code
        try {
            const qrisData = this.qrisService.generateQrisPayload(validation.amount);
            const qrCodeBuffer = await this.qrisService.generateQRCode(qrisData);
            
            // Convert buffer to base64 and create media
            const base64Data = qrCodeBuffer.toString('base64');
            const media = new MessageMedia('image/png', base64Data, 'qris_payment.png');
            
            // Send QR code with payment details
            const paymentMessage = formatPaymentMessage(validation.amount);

            await this.client.sendMessage(message.from, media, { caption: paymentMessage });
            
            logger.info(`QRIS QR code sent to ${message.from} for amount: Rp ${validation.amount.toLocaleString('id-ID')}`);
            
        } catch (error) {
            logger.error('Error generating QRIS QR code:', error);
            await this.whatsappService.sendErrorMessage(
                message.from, 
                'Maaf, terjadi kesalahan saat membuat QR code pembayaran. Silakan coba lagi.'
            );
        }
    }

    async start() {
        try {
            logger.info('Starting WhatsApp bot...');
            await this.client.initialize();
        } catch (error) {
            logger.error('Failed to start WhatsApp bot:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            throw error;
        }
    }

    async stop() {
        try {
            logger.info('Stopping WhatsApp bot...');
            await this.client.destroy();
        } catch (error) {
            logger.error('Error stopping WhatsApp bot:', error);
            throw error;
        }
    }
}

// Create and start the bot
const bot = new WhatsAppBot();

// Handle graceful shutdown
process.on('SIGINT', async () => {
    logger.info('Received SIGINT, shutting down gracefully...');
    try {
        await bot.stop();
        process.exit(0);
    } catch (error) {
        logger.error('Error during shutdown:', error);
        process.exit(1);
    }
});

process.on('SIGTERM', async () => {
    logger.info('Received SIGTERM, shutting down gracefully...');
    try {
        await bot.stop();
        process.exit(0);
    } catch (error) {
        logger.error('Error during shutdown:', error);
        process.exit(1);
    }
});

// Start the bot
bot.start().catch((error) => {
    logger.error('Failed to start bot:', {
        message: error.message,
        stack: error.stack,
        name: error.name
    });
    console.error('Detailed error:', error);
    process.exit(1);
});

module.exports = WhatsAppBot;
