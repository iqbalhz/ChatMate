# WhatsApp QRIS Payment Bot

A Node.js WhatsApp bot that generates QRIS (Quick Response Indonesian Standard) payment QR codes for seamless payment processing. Users can send payment commands like "bayar 50000" and receive dynamic QR codes instantly.

## Features

- 🤖 **WhatsApp Integration**: Automated responses to payment commands
- 💳 **QRIS Generation**: EMV-compliant QR codes for Indonesian payments
- ✅ **Payment Validation**: Amount range checking (Rp 1,000 - Rp 10,000,000)
- 🔒 **Individual Chat Only**: Responds only to direct messages, ignores group chats
- 📝 **Customizable Messages**: Configurable auto-reply templates
- 🏗️ **Gateway Ready**: Architecture supports real payment gateway integration

## Quick Start

### Prerequisites

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org)
- **Chrome/Chromium browser** (for WhatsApp Web automation)
- **WhatsApp account** for bot authentication

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/whatsapp-qris-bot.git
   cd whatsapp-qris-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the bot**
   ```bash
   node index.js
   ```

4. **Authenticate with WhatsApp**
   - A QR code will appear in your terminal
   - Scan it with WhatsApp on your phone (Settings > Linked Devices)
   - Wait for "WhatsApp client is ready!" message

## Usage

### Payment Commands

Send these messages to the bot via WhatsApp:

- `bayar 50000` - Generate QR code for Rp 50,000
- `bayar 25000` - Generate QR code for Rp 25,000
- `help` or `bantuan` - Show help message

### Supported Amount Range

- **Minimum**: Rp 1,000
- **Maximum**: Rp 10,000,000

## Project Structure

```
whatsapp-qris-bot/
├── config/
│   ├── config.js          # Merchant configuration
│   └── messages.js        # Customizable message templates
├── services/
│   ├── qris.js           # QRIS QR code generation
│   └── whatsapp.js       # WhatsApp client management
├── utils/
│   ├── logger.js         # Logging system
│   └── validation.js     # Payment validation
├── index.js              # Main bot controller
├── package.json          # Dependencies
└── README.md             # This file
```

## Configuration

### Merchant Settings

Edit `config/config.js` to customize merchant information:

```javascript
const config = {
  merchant: {
    name: 'TOKO EXAMPLE',           // Your business name
    city: 'JAKARTA',                // Your city
    merchantId: 'ID.CO.EXAMPLE.WWW', // Your merchant ID
    accountInfo: '1234567890',      // Your account number
    currency: '360'                 // Indonesian Rupiah (360)
  }
};
```

### Message Templates

Customize auto-reply messages in `config/messages.js`:

```javascript
const messages = {
  help: 'Kirim "bayar [jumlah]" untuk membuat kode QR pembayaran\n\nContoh: bayar 50000',
  paymentSuccess: (amount, formattedAmount) => 
    `✅ Kode QR pembayaran berhasil dibuat!\n💰 Jumlah: ${formattedAmount}`,
  invalidAmount: 'Jumlah harus antara Rp 1.000 - Rp 10.000.000',
  invalidFormat: 'Format salah. Gunakan: bayar [jumlah]\n\nContoh: bayar 50000'
};
```

## Payment Gateway Integration

This bot uses demo merchant data and is ready for integration with Indonesian payment gateways:

### Supported Gateways

- **Midtrans** - Popular payment gateway
- **Xendit** - Multi-payment platform
- **DOKU** - Digital payment solution
- **OVO Business** - E-wallet integration
- **GoPay Business** - Digital wallet
- **LinkAja Business** - Mobile payment

### Integration Steps

1. **Choose a payment gateway** and register merchant account
2. **Update merchant credentials** in `config/config.js`
3. **Add payment API calls** in `services/qris.js`
4. **Implement payment status callbacks** for transaction verification

## Development

### Local Development

```bash
# Install dependencies
npm install

# Start in development mode
node index.js

# View logs
tail -f logs/app.log
```

### Testing

Test payment commands:
- Valid: `bayar 50000`, `bayar 1000`, `bayar 10000000`
- Invalid: `bayar 500`, `bayar 20000000`, `pay 50000`

### Logging

The bot includes comprehensive logging:
- **Console output**: Real-time status updates
- **File logging**: Detailed logs in `logs/` directory
- **Error tracking**: Failed operations and debugging info

## Security Notes

- **Demo Mode**: Currently uses example merchant data
- **Session Security**: WhatsApp sessions stored locally in `.wwebjs_auth/`
- **Production**: Replace demo credentials before production use
- **API Keys**: Store payment gateway credentials securely

## Troubleshooting

### Common Issues

**QR Code not appearing:**
- Ensure Chrome/Chromium is installed
- Check terminal for error messages
- Restart the bot: `Ctrl+C` then `node index.js`

**Bot not responding:**
- Verify WhatsApp authentication
- Check if individual chat (not group)
- Review console logs for errors

**Dependencies error:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### System Requirements

- **Memory**: Minimum 512MB RAM
- **Storage**: 200MB free space
- **Network**: Stable internet connection
- **Browser**: Chrome/Chromium for WhatsApp Web

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For issues and questions:
- Check the troubleshooting section above
- Review console logs for error details
- Ensure all dependencies are properly installed

---

**Ready for Production**: Replace demo merchant data with real payment gateway credentials to start processing actual payments.