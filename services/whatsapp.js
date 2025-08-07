const logger = require('../utils/logger');

class WhatsAppService {
    constructor(client) {
        this.client = client;
    }

    async sendMessage(chatId, message) {
        try {
            await this.client.sendMessage(chatId, message);
            logger.info(`Message sent to ${chatId}`);
        } catch (error) {
            logger.error(`Failed to send message to ${chatId}:`, error);
            throw error;
        }
    }

    async sendHelpMessage(chatId) {
        const helpMessage = `🤖 *WhatsApp QRIS Bot*\n\n` +
                          `Untuk melakukan pembayaran, gunakan format:\n` +
                          `*bayar [jumlah]*\n\n` +
                          `Contoh:\n` +
                          `• bayar 50000\n` +
                          `• bayar 150000\n` +
                          `• bayar 1000000\n\n` +
                          `📝 *Ketentuan:*\n` +
                          `• Jumlah minimal: Rp 1.000\n` +
                          `• Jumlah maksimal: Rp 10.000.000\n` +
                          `• Hanya angka, tanpa titik atau koma\n\n` +
                          `💡 Bot akan mengirimkan QR code QRIS untuk pembayaran`;

        await this.sendMessage(chatId, helpMessage);
    }

    async sendErrorMessage(chatId, errorMessage) {
        const formattedError = `❌ *Error*\n\n${errorMessage}\n\n` +
                              `Ketik "bayar" untuk melihat panduan penggunaan.`;
        
        await this.sendMessage(chatId, formattedError);
    }

    async isConnected() {
        try {
            return await this.client.getState() === 'CONNECTED';
        } catch (error) {
            logger.error('Error checking connection state:', error);
            return false;
        }
    }

    async getContactInfo(chatId) {
        try {
            const contact = await this.client.getContactById(chatId);
            return {
                id: contact.id._serialized,
                name: contact.name || contact.pushname || 'Unknown',
                isMyContact: contact.isMyContact
            };
        } catch (error) {
            logger.error(`Failed to get contact info for ${chatId}:`, error);
            return null;
        }
    }
}

module.exports = WhatsAppService;
