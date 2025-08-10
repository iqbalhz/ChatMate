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
        // Detect Chrome/Chromium executable for different environments
        let chromiumPath = this.findChromiumExecutable();
        
        logger.info('Starting WhatsApp Bot...');
        logger.info(`Using Chrome executable: ${chromiumPath || 'bundled'}`);
        
        // Detect WSL2 environment
        const isWSL = process.env.WSL_DISTRO_NAME || process.platform === 'linux';
        logger.info(`Environment detected: ${isWSL ? 'WSL2/Linux' : 'Standard'}`);

        this.client = new Client({
            authStrategy: new LocalAuth(),
            puppeteer: {
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
                    '--disable-features=TranslateUI,VizDisplayCompositor',
                    '--disable-ipc-flooding-protection',
                    '--no-first-run',
                    '--disable-gpu',
                    '--disable-extensions',
                    '--disable-default-apps',
                    '--no-default-browser-check',
                    '--disable-web-security',
                    '--disable-features=VizDisplayCompositor',
                    '--single-process', // Important for WSL2
                    '--no-zygote', // Important for WSL2
                    '--disable-blink-features=AutomationControlled',
                    ...(isWSL ? [
                        '--disable-software-rasterizer',
                        '--disable-background-networking',
                        '--disable-background-processes',
                        '--disable-client-side-phishing-detection',
                        '--disable-sync',
                        '--metrics-recording-only',
                        '--disable-hang-monitor',
                        '--disable-prompt-on-repost',
                        '--disable-domain-reliability'
                    ] : [])
                ],
                timeout: 60000 // Increase timeout for WSL2
            }
        });
        
        this.whatsappService = new WhatsAppService(this.client);
        this.qrisService = new QrisService();
        
        this.setupEventHandlers();
    }

    findChromiumExecutable() {
        const possiblePaths = [
            '/usr/bin/google-chrome-stable',
            '/usr/bin/google-chrome',
            '/usr/bin/chromium-browser',
            '/usr/bin/chromium',
            '/snap/bin/chromium',
            process.env.CHROME_BIN,
            process.env.GOOGLE_CHROME_BIN
        ];

        for (const path of possiblePaths) {
            if (path) {
                try {
                    execSync(`test -x "${path}"`, { stdio: 'ignore' });
                    logger.info(`Found Chrome executable: ${path}`);
                    return path;
                } catch (error) {
                    // Continue checking other paths
                }
            }
        }

        // Try using 'which' command
        try {
            const chromiumPath = execSync('which google-chrome-stable || which google-chrome || which chromium-browser || which chromium', { encoding: 'utf8' }).trim();
            if (chromiumPath) {
                logger.info(`Found Chrome via which: ${chromiumPath}`);
                return chromiumPath;
            }
        } catch (error) {
            logger.warn('Could not find Chrome executable with which command');
        }

        logger.warn('Using bundled Chromium (may cause issues in WSL2)');
        return null;
    }

    setupEventHandlers() {
        this.client.on('qr', (qr) => {
            logger.info('QR RECEIVED, scan with your phone to log in');
            console.log('\n=== WhatsApp QR Code ===');
            
            // Generate very small QR code for small screens
            QRCode.toString(qr, { 
                type: 'terminal',
                small: true,
                width: 25
            }, (err, smallQR) => {
                if (err) {
                    logger.error('Error generating small QR code:', err);
                } else {
                    console.log(smallQR);
                }
            });

            // Also save QR as PNG file for easier scanning
            QRCode.toFile('./whatsapp_qr.png', qr, {
                width: 300,
                margin: 2
            }, (err) => {
                if (err) {
                    logger.error('Error saving QR code file:', err);
                } else {
                    console.log('\nQR code also saved as: whatsapp_qr.png');
                }
            });

            console.log('\nHow to connect:');
            console.log('1. Open WhatsApp on phone');
            console.log('2. Settings → Linked Devices');
            console.log('3. Scan QR code above');
            console.log('========================\n');
        });

        this.client.on('ready', () => {
            logger.info('WhatsApp bot is ready!');
            console.log('\n✅ Bot is connected and ready to receive messages!');
            console.log('Send "bayar 50000" to test payment QR generation\n');
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
            console.log('\n❌ WhatsApp disconnected. Reason:', reason);
        });

        this.client.on('auth_failure', (msg) => {
            logger.error('Authentication failure:', msg);
            console.log('\n❌ Authentication failed:', msg);
            console.log('Please scan the QR code again with your phone\n');
        });

        this.client.on('loading_screen', (percent, message) => {
            logger.info(`Loading... ${percent}% - ${message}`);
            console.log(`Loading... ${percent}% - ${message}`);
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
