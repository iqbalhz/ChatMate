# WhatsApp QRIS Payment Bot

## Overview

This is a WhatsApp bot that generates QRIS (Quick Response Indonesian Standard) payment QR codes. The bot allows users to request payment QR codes by sending payment commands through WhatsApp messages. It integrates WhatsApp Web API with QRIS payment generation following EMV QR Code specifications.

The bot accepts payment requests in Indonesian Rupiah, validates amounts, generates QRIS-compliant QR codes, and sends them back to users through WhatsApp. It's designed for Indonesian market payment processing with built-in validation and error handling.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Core Architecture
The application follows a service-oriented architecture with clear separation of concerns:

- **Main Bot Controller** (`index.js`): Orchestrates the WhatsApp client, handles incoming messages, and coordinates between services
- **Service Layer**: Modular services for WhatsApp operations and QRIS generation
- **Utility Layer**: Shared utilities for validation, logging, and configuration management

### WhatsApp Integration
- **Technology**: whatsapp-web.js library with Puppeteer backend
- **Authentication**: LocalAuth strategy for persistent sessions
- **Message Handling**: Event-driven architecture for QR code generation, message processing, and connection management
- **Deployment Considerations**: Configured for headless operation with sandbox-disabled Puppeteer for containerized environments

### Payment Processing
- **QRIS Generation**: Custom implementation following EMV QR Code specifications
- **Payment Validation**: Amount range validation (Rp 1,000 - Rp 10,000,000)
- **Command Parsing**: Natural language processing for "bayar [amount]" commands in Indonesian
- **QR Code Output**: PNG format with configurable quality and error correction

### Configuration Management
- **Environment-based Configuration**: Merchant details, payment limits, and logging levels configurable via environment variables
- **Default Fallbacks**: Sensible defaults for all configuration parameters
- **Merchant Customization**: Configurable merchant name, city, account information, and currency settings

### Error Handling and Logging
- **Structured Logging**: Custom logger with configurable log levels (ERROR, WARN, INFO, DEBUG)
- **Graceful Error Recovery**: Comprehensive error handling with user-friendly Indonesian error messages
- **Connection Monitoring**: Automatic disconnection detection and logging

### Message Flow
1. User sends "bayar [amount]" command
2. Bot validates command format and amount range
3. QRIS payload generated according to EMV specifications
4. QR code image created and sent back to user
5. Error messages sent for invalid requests with usage instructions

## External Dependencies

### Core Dependencies
- **whatsapp-web.js**: WhatsApp Web API integration for message handling and QR code authentication
- **qrcode**: QR code generation library for creating QRIS payment codes
- **puppeteer**: Headless browser automation (indirect dependency via whatsapp-web.js)

### Runtime Requirements
- **Node.js**: JavaScript runtime environment
- **Chrome/Chromium**: Required by Puppeteer for WhatsApp Web automation

### Ready for Payment Gateway Integration
- **Current Status**: Demo QRIS generation with example merchant data
- **Integration Points**: 
  - Update merchant credentials in `config/config.js`
  - Add payment gateway API calls in `services/qris.js`
  - Implement payment status callbacks
- **Supported Gateways**: Midtrans, Xendit, DOKU, OVO Business, GoPay Business, LinkAja Business
- **Next Steps**: 
  1. Choose payment gateway provider
  2. Register merchant account
  3. Replace example credentials with real merchant data
  4. Add payment processing API integration

### Additional Integration Options
- **Database**: Architecture supports adding transaction logging and user management
- **Monitoring Services**: Logging structure compatible with external monitoring solutions
- **Authentication Services**: Merchant authentication system can be integrated for multi-tenant usage