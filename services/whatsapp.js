const logger = require('../utils/logger');
const { formatHelpMessage, formatErrorMessage } = require('../config/messages');

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
        const helpMessage = formatHelpMessage();
        await this.sendMessage(chatId, helpMessage);
    }

    async sendErrorMessage(chatId, errorMessage) {
        const formattedError = formatErrorMessage(errorMessage);
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
