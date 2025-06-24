const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

// Configuration
const CONFIG = {
    numbersFile: 'phone_numbers.txt',
    messageFile: 'message.txt',
    delayBetweenMessages: 2000, // 2 seconds delay (safer)
    countryCode: '977', // Country code for Nepal
    maxMessagesPerSession: 1000, // Maximum messages per session
    randomDelayRange: 2000 // Random delay between 3-7 seconds
};

class WhatsAppBot {
    constructor() {
        this.client = new Client({
            authStrategy: new LocalAuth(),
            puppeteer: {
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            }
        });
        
        this.setupEventHandlers();
    }

    setupEventHandlers() {
        // Generate QR Code for authentication
        this.client.on('qr', (qr) => {
            console.log('QR Code received, scan it with your WhatsApp:');
            console.log('Note: If you see this repeatedly, try deleting the .wwebjs_auth folder and restarting');
            qrcode.generate(qr, { small: true, scale: 1 });
        });

        // Client is ready
        this.client.on('ready', () => {
            console.log('✅ WhatsApp Bot is ready!');
            console.log('📱 Session authenticated successfully');
            this.startMessaging();
        });

        // Authentication failure
        this.client.on('auth_failure', (msg) => {
            console.error('❌ Authentication failed:', msg);
            console.log('💡 Try deleting the .wwebjs_auth folder and restarting');
        });

        // Disconnected
        this.client.on('disconnected', (reason) => {
            console.log('🔌 Client was disconnected:', reason);
            console.log('💡 You may need to scan QR code again');
        });

        // Loading screen
        this.client.on('loading_screen', (percent, message) => {
            console.log(`🔄 Loading: ${percent}% - ${message}`);
        });

        // Handle incoming messages (button responses)
        this.client.on('message', async (message) => {
            const userResponse = message.body.trim();
            
            if (userResponse === 'Yes I am interested') {
                await this.handleInterestResponse(message);
            } else if (userResponse === 'Visit Website') {
                await this.handleWebsiteResponse(message);
            }
        });
    }

    // Handle "Yes I am interested" button response
    async handleInterestResponse(message) {
        try {
            const response = `Thank you for your interest! 🙏

I'm excited to help you create a beautiful website for your business. 

Let me know:
• What type of business you have
• Any specific features you'd like
• Your budget range

I'll get back to you with a customized proposal within 24 hours.

Best regards,
Team WebGhar 🌐`;

            await message.reply(response);
            console.log(`✅ Interest response sent to ${message.from}`);
        } catch (error) {
            console.error('❌ Failed to send interest response:', error.message);
        }
    }

    // Handle "Visit Website" button response
    async handleWebsiteResponse(message) {
        try {
            const response = `🌐 Visit our website: https://webgharofficial.github.io/WebGhar/

Here you can:
• See our portfolio of work
• Learn about our services
• View pricing packages
• Contact us directly

Feel free to explore and let me know if you have any questions! 😊`;

            await message.reply(response);
            console.log(`✅ Website response sent to ${message.from}`);
        } catch (error) {
            console.error('❌ Failed to send website response:', error.message);
        }
    }

    // Read phone numbers from file
    readPhoneNumbers() {
        try {
            if (!fs.existsSync(CONFIG.numbersFile)) {
                console.error(`Phone numbers file '${CONFIG.numbersFile}' not found!`);
                console.log('Please create a file named phone_numbers.txt with business data in CSV format: phone,name,address,category,rating,website');
                return [];
            }

            const content = fs.readFileSync(CONFIG.numbersFile, 'utf8');
            const lines = content
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);

            const businesses = [];
            
            lines.forEach(line => {
                const parts = line.split(',');
                if (parts.length >= 1) {
                    let phoneNumber = parts[0].trim();
                    
                    // Remove any non-digit characters except +
                    let cleanNumber = phoneNumber.replace(/\D/g, '');
                    
                    // Add country code if missing
                    if (!cleanNumber.startsWith(CONFIG.countryCode)) {
                        cleanNumber = CONFIG.countryCode + cleanNumber;
                    }
                    
                    // Create business object
                    const business = {
                        phone: cleanNumber,
                        name: parts[1] || 'Unknown Business',
                        address: parts[2] || 'Unknown Address',
                        category: parts[3] || 'Business',
                        rating: parts[4] || 'N/A',
                        website: parts[5] || 'No website'
                    };
                    
                    businesses.push(business);
                }
            });

            console.log(`Found ${businesses.length} businesses in phone_numbers.txt`);
            return businesses;
        } catch (error) {
            console.error('Error reading phone numbers file:', error.message);
            return [];
        }
    }

    // Read custom message from file
    readMessage() {
        try {
            if (!fs.existsSync(CONFIG.messageFile)) {
                console.error(`Message file '${CONFIG.messageFile}' not found!`);
                console.log('Please create a file named message.txt with your custom message.');
                return null;
            }

            const message = fs.readFileSync(CONFIG.messageFile, 'utf8').trim();
            if (!message) {
                console.error('Message file is empty!');
                return null;
            }

            console.log('Message to send:', message);
            return message;
        } catch (error) {
            console.error('Error reading message file:', error.message);
            return null;
        }
    }

    // Send message to a single business
    async sendMessage(business, message) {
        try {
            const chatId = business.phone.includes('@c.us') ? business.phone : `${business.phone}@c.us`;
            // Attach image
            const imagePath = 'advertisement.png';
            let media = null;
            if (fs.existsSync(imagePath)) {
                media = MessageMedia.fromFilePath(imagePath);
            }
            if (media) {
                await this.client.sendMessage(chatId, media, { caption: message });
            } else {
                await this.client.sendMessage(chatId, message);
            }
            console.log(`✅ Message sent successfully to ${business.name} (${business.phone})`);
            return true;
        } catch (error) {
            console.error(`❌ Failed to send message to ${business.name} (${business.phone}):`, error.message);
            return false;
        }
    }

    // Generate personalized message for a business
    generatePersonalizedMessage(business, baseMessage) {
        // If baseMessage contains placeholders, replace them
        let personalizedMessage = baseMessage;
        
        // Replace placeholders with business data
        personalizedMessage = personalizedMessage.replace(/{business_name}/g, business.name);
        personalizedMessage = personalizedMessage.replace(/{business_address}/g, business.address);
        personalizedMessage = personalizedMessage.replace(/{business_category}/g, business.category);
        personalizedMessage = personalizedMessage.replace(/{business_rating}/g, business.rating);
        
        return personalizedMessage;
    }

    // Send messages to all businesses with delay
    async sendMessagesToAll(businesses, message) {
        console.log(`\n🚀 Starting to send messages to ${businesses.length} businesses...\n`);
        
        // Safety check
        if (businesses.length > CONFIG.maxMessagesPerSession) {
            console.log(`⚠️  WARNING: You're trying to send ${businesses.length} messages.`);
            console.log(`   Maximum recommended: ${CONFIG.maxMessagesPerSession}`);
            console.log(`   Consider splitting into smaller batches.\n`);
        }
        
        let successCount = 0;
        let failureCount = 0;

        for (let i = 0; i < businesses.length; i++) {
            const business = businesses[i];
            console.log(`📱 Sending message ${i + 1}/${businesses.length} to ${business.name} (${business.phone})...`);
            
            // Generate personalized message
            const personalizedMessage = this.generatePersonalizedMessage(business, message);
            
            const success = await this.sendMessage(business, personalizedMessage);
            
            if (success) {
                successCount++;
            } else {
                failureCount++;
            }

            // Add random delay between messages to avoid detection
            if (i < businesses.length - 1) {
                const randomDelay = CONFIG.delayBetweenMessages + Math.random() * CONFIG.randomDelayRange;
                console.log(`⏳ Waiting ${Math.round(randomDelay/1000)} seconds before next message...`);
                await new Promise(resolve => setTimeout(resolve, randomDelay));
            }
        }

        console.log(`\n📊 Messaging completed!`);
        console.log(`✅ Successful: ${successCount}`);
        console.log(`❌ Failed: ${failureCount}`);
        console.log(`📱 Total: ${businesses.length}`);
        
        if (successCount > 0) {
            console.log(`\n💡 Safety Tips:`);
            console.log(`   - Wait at least 1 hour before sending more messages`);
            console.log(`   - Only message people who have your number saved`);
            console.log(`   - Use personalized messages when possible`);
        }
    }

    // Start the messaging process
    async startMessaging() {
        const businesses = this.readPhoneNumbers();
        const message = this.readMessage();

        if (businesses.length === 0) {
            console.log('No businesses found. Please check your phone_numbers.txt file.');
            return;
        }

        if (!message) {
            console.log('No message found. Please check your message.txt file.');
            return;
        }

        await this.sendMessagesToAll(businesses, message);
        
        // Keep the client alive for a while to ensure all messages are sent
        setTimeout(() => {
            console.log('Bot session completed. You can close the application.');
            process.exit(0);
        }, 5000);
    }

    // Initialize the bot
    initialize() {
        console.log('🤖 WhatsApp Bot Starting...');
        console.log('📱 Make sure you have the following files ready:');
        console.log(`   - ${CONFIG.numbersFile} (phone numbers, one per line)`);
        console.log(`   - ${CONFIG.messageFile} (your custom message)`);
        console.log('\n📋 Configuration:');
        console.log(`   - Country Code: ${CONFIG.countryCode}`);
        console.log(`   - Delay between messages: ${CONFIG.delayBetweenMessages/1000} seconds`);
        console.log('\n🔐 Scan the QR code when it appears to authenticate with WhatsApp...\n');
        
        this.client.initialize();
    }
}

// Create and start the bot
const bot = new WhatsAppBot();
bot.initialize();

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down WhatsApp Bot...');
    process.exit(0);
}); 