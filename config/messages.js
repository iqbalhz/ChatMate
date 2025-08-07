/**
 * Message templates for WhatsApp QRIS Bot
 * Customize these templates to change bot responses
 */

const messageTemplates = {
    // Bot introduction and help message
    help: {
        title: '🤖 *WhatsApp QRIS Bot*',
        instruction: 'Untuk melakukan pembayaran, gunakan format:',
        commandFormat: '*bayar [jumlah]*',
        examples: {
            header: 'Contoh:',
            items: [
                '• bayar 50000',
                '• bayar 150000', 
                '• bayar 1000000'
            ]
        },
        rules: {
            header: '📝 *Ketentuan:*',
            items: [
                '• Jumlah minimal: Rp 1.000',
                '• Jumlah maksimal: Rp 10.000.000',
                '• Hanya angka, tanpa titik atau koma'
            ]
        },
        footer: '💡 Bot akan mengirimkan QR code QRIS untuk pembayaran'
    },

    // Payment success message (sent with QR code)
    paymentSuccess: {
        header: '💳 *QRIS Pembayaran*',
        amountLabel: '💰 Jumlah:',
        instruction: '📱 Scan QR code di bawah ini untuk melakukan pembayaran',
        disclaimer: '⚠️ *Catatan:* QR code ini adalah contoh untuk demonstrasi',
        // Optional: Add merchant info
        merchantInfo: {
            enabled: false,
            name: 'TOKO EXAMPLE',
            location: 'Jakarta'
        }
    },

    // Error message format
    error: {
        header: '❌ *Error*',
        footer: 'Ketik "bayar" untuk melihat panduan penggunaan.'
    },

    // Validation error messages
    validation: {
        invalidNumber: '❌ Jumlah pembayaran harus berupa angka.\n\nContoh: bayar 50000',
        invalidInteger: '❌ Jumlah pembayaran harus berupa bilangan bulat.\n\nContoh: bayar 75000',
        belowMinimum: (minAmount) => `❌ Jumlah pembayaran minimal adalah Rp ${minAmount.toLocaleString('id-ID')}.\n\nContoh: bayar ${minAmount}`,
        aboveMaximum: (maxAmount) => `❌ Jumlah pembayaran maksimal adalah Rp ${maxAmount.toLocaleString('id-ID')}.\n\nContoh: bayar ${maxAmount}`,
        validationError: '❌ Terjadi kesalahan dalam validasi jumlah pembayaran. Silakan coba lagi.'
    },

    // System messages
    system: {
        processingError: 'Terjadi kesalahan dalam memproses pesan Anda.',
        qrGenerationError: 'Maaf, terjadi kesalahan saat membuat QR code pembayaran. Silakan coba lagi.',
        connectionReady: 'WhatsApp bot is ready!',
        qrReceived: 'QR RECEIVED, scan with your phone to log in'
    },

    // Welcome message (optional - sent when user first connects)
    welcome: {
        enabled: false,
        message: '👋 Selamat datang! Saya adalah bot pembayaran QRIS.\n\nKetik "bayar [jumlah]" untuk memulai pembayaran.\nContoh: bayar 50000'
    }
};

/**
 * Format help message from template
 */
function formatHelpMessage() {
    const { help } = messageTemplates;
    return `${help.title}\n\n` +
           `${help.instruction}\n` +
           `${help.commandFormat}\n\n` +
           `${help.examples.header}\n` +
           `${help.examples.items.join('\n')}\n\n` +
           `${help.rules.header}\n` +
           `${help.rules.items.join('\n')}\n\n` +
           `${help.footer}`;
}

/**
 * Format payment success message from template
 */
function formatPaymentMessage(amount) {
    const { paymentSuccess } = messageTemplates;
    let message = `${paymentSuccess.header}\n\n` +
                  `${paymentSuccess.amountLabel} Rp ${amount.toLocaleString('id-ID')}\n` +
                  `${paymentSuccess.instruction}\n\n`;
    
    // Add merchant info if enabled
    if (paymentSuccess.merchantInfo.enabled) {
        message += `🏪 Merchant: ${paymentSuccess.merchantInfo.name}\n` +
                   `📍 Lokasi: ${paymentSuccess.merchantInfo.location}\n\n`;
    }
    
    message += paymentSuccess.disclaimer;
    return message;
}

/**
 * Format error message from template
 */
function formatErrorMessage(errorText) {
    const { error } = messageTemplates;
    return `${error.header}\n\n${errorText}\n\n${error.footer}`;
}

module.exports = {
    messageTemplates,
    formatHelpMessage,
    formatPaymentMessage,
    formatErrorMessage
};