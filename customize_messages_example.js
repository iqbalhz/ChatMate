/**
 * Example of how to customize WhatsApp bot messages
 * 
 * This file demonstrates different customization options.
 * Edit config/messages.js to apply your changes.
 */

const { messageTemplates } = require('./config/messages');

console.log('Current Message Templates Configuration:');
console.log('=======================================\n');

// Show current help message
console.log('1. HELP MESSAGE (when user types "bayar" incorrectly)');
console.log('Current format:');
console.log(messageTemplates.help);
console.log('\n');

// Show current payment success message
console.log('2. PAYMENT SUCCESS MESSAGE (sent with QR code)');
console.log('Current format:');
console.log(messageTemplates.paymentSuccess);
console.log('\n');

// Show customization examples
console.log('3. CUSTOMIZATION EXAMPLES');
console.log('=========================\n');

console.log('A) To change the bot name, edit messageTemplates.help.title:');
console.log('   FROM: "🤖 *WhatsApp QRIS Bot*"');
console.log('   TO:   "🏪 *Toko ABC Payment Bot*"\n');

console.log('B) To add merchant info to payment messages, edit:');
console.log('   messageTemplates.paymentSuccess.merchantInfo.enabled = true');
console.log('   messageTemplates.paymentSuccess.merchantInfo.name = "Your Store Name"');
console.log('   messageTemplates.paymentSuccess.merchantInfo.location = "Your City"\n');

console.log('C) To change payment limits display, edit:');
console.log('   messageTemplates.help.rules.items array\n');

console.log('D) To use English messages instead of Indonesian:');
console.log('   Edit all text strings in config/messages.js\n');

// Example of English version
const englishExample = {
    help: {
        title: '🤖 *WhatsApp QRIS Bot*',
        instruction: 'To make a payment, use this format:',
        commandFormat: '*bayar [amount]*',
        examples: {
            header: 'Examples:',
            items: [
                '• bayar 50000',
                '• bayar 150000', 
                '• bayar 1000000'
            ]
        },
        rules: {
            header: '📝 *Rules:*',
            items: [
                '• Minimum amount: Rp 1,000',
                '• Maximum amount: Rp 10,000,000',
                '• Numbers only, no dots or commas'
            ]
        },
        footer: '💡 Bot will send QRIS QR code for payment'
    }
};

console.log('E) English version example:');
console.log(JSON.stringify(englishExample.help, null, 2));

console.log('\n\n4. HOW TO APPLY CHANGES');
console.log('=======================');
console.log('1. Edit the file: config/messages.js');
console.log('2. Modify the messageTemplates object');
console.log('3. Restart the bot to apply changes');
console.log('4. Test by scanning QR code and sending messages');