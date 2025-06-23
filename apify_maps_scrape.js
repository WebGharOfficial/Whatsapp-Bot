const axios = require('axios');
const fs = require('fs');
const config = require('./config');

// === CONFIGURATION ===
const APIFY_API_TOKEN = 'apify_api_fvyxPcIW2sROI35594vZnsrl2wtf2W1QXNmj';
const ACTOR_ID = 'nwua9Gu5YrADL7ZDj'; // Google Maps Scraper actor
const SEARCHES = config.businessFinder.searchQueries.map(q => `${q} ${config.businessFinder.location}`);
const NUMBERS_FILE = config.whatsapp.numbersFile;
const BUSINESS_DATA_FILE = 'business_data.json';
const MESSAGES_FILE = 'custom_messages.txt';

// Generate personalized message for each business
function generatePersonalizedMessage(business, webGharConfig) {
    const businessName = business.title || business.name || 'your business';
    const businessType = business.category || 'business';
    const location = business.address || business.location || 'your area';
    
    // Random greeting variations
    const greetings = [
        `Namaste! 🙏`,
        `Hello! 👋`,
        `Hi there! 😊`,
        `Greetings! 🌟`
    ];
    
    // Random introduction variations
    const introductions = [
        `I hope this message finds you well.`,
        `I hope you're having a great day.`,
        `I hope business is going well for you.`,
        `I hope everything is running smoothly.`
    ];
    
    // Random pitch variations
    const pitches = [
        `I noticed ${businessName} doesn't have a website yet, and I'd love to help you establish a strong online presence.`,
        `I came across ${businessName} and thought you might benefit from having a professional website to reach more customers.`,
        `I believe ${businessName} would really shine with a beautiful website to showcase your ${businessType}.`,
        `I think ${businessName} deserves a stunning website to attract more customers in ${location}.`
    ];
    
    // Random closing variations
    const closings = [
        `Would love to discuss how we can help grow your business online!`,
        `Let's chat about how we can boost your online presence!`,
        `Ready to take your business to the next level online?`,
        `Let's make your business stand out online!`
    ];
    
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];
    const introduction = introductions[Math.floor(Math.random() * introductions.length)];
    const pitch = pitches[Math.floor(Math.random() * pitches.length)];
    const closing = closings[Math.floor(Math.random() * closings.length)];
    
    const message = `${greeting}

${introduction}

${pitch}

🏢 **About WebGhar:**
• ${webGharConfig.features.join('\n• ')}
• ${webGharConfig.pricing} pricing starting from Rs. 15,000

📞 **Contact:**
• Phone: ${webGharConfig.contactInfo.phone}
• Email: ${webGharConfig.contactInfo.email}
• Website: ${webGharConfig.contactInfo.website}

${closing}

Best regards,
Team WebGhar 🌐`;

    return message;
}

async function runApifyScraper() {
    console.log('🚀 Triggering Apify Google Maps Scraper for Tokha, Kathmandu...');
    console.log(`🔍 Search queries: ${SEARCHES.join(', ')}`);
    
    try {
        // 1. Start the actor run
        const runResponse = await axios.post(
            `https://api.apify.com/v2/acts/${ACTOR_ID}/runs?token=${APIFY_API_TOKEN}&wait=1`,
            {
                "searchStringsArray": SEARCHES,
                "maxCrawledPlacesPerSearch": 30, // Increased to get more results
                "language": "en",
                "includeHistogram": false,
                "includeOpeningHours": false,
                "includePeopleAlsoSearch": false,
                "includeImages": false,
                "includeReviews": false,
                "includeBasicInfo": true,
                "includeContactInfo": true,
                "includeMoreInfo": true // Enable to get more business details
            },
            { headers: { 'Content-Type': 'application/json' } }
        );
        const runId = runResponse.data.data.id;
        console.log(`⏳ Actor started. Run ID: ${runId}`);

        // 2. Poll for run to finish
        let status = 'RUNNING';
        let pollCount = 0;
        let statusResp;
        while (status === 'RUNNING' || status === 'READY' || status === 'STARTING') {
            await new Promise(res => setTimeout(res, 10000)); // Wait 10 seconds
            pollCount++;
            statusResp = await axios.get(`https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_API_TOKEN}`);
            status = statusResp.data.data.status;
            console.log(`   Poll #${pollCount}: Status = ${status}`);
        }
        if (status !== 'SUCCEEDED') {
            console.error('❌ Apify run did not succeed:', status);
            return;
        }

        // 3. Get dataset items (results)
        const datasetId = statusResp.data.data.defaultDatasetId;
        const datasetUrl = `https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_API_TOKEN}&format=json`;
        const resultsResp = await axios.get(datasetUrl);
        const items = resultsResp.data;
        console.log(`✅ Downloaded ${items.length} results from Apify.`);

        // 4. Process business data and extract information
        const businessData = [];
        const phoneNumbers = [];
        const customMessages = [];
        
        for (const item of items) {
            if (item.phone) {
                const cleanPhone = item.phone.replace(/[^\d+]/g, '');
                if (cleanPhone.length >= 10) {
                    phoneNumbers.push(cleanPhone);
                    
                    // Create business data object
                    const business = {
                        name: item.title || item.name || 'Unknown Business',
                        phone: cleanPhone,
                        address: item.address || item.location || 'Unknown Address',
                        category: item.category || item.type || 'Business',
                        rating: item.rating || 'N/A',
                        reviews: item.reviews || 'N/A',
                        website: item.website || 'No website',
                        email: item.email || 'N/A',
                        hours: item.openingHours || 'N/A',
                        description: item.description || 'N/A'
                    };
                    
                    businessData.push(business);
                    
                    // Generate personalized message
                    const message = generatePersonalizedMessage(business, config.webGhar);
                    customMessages.push({
                        business: business.name,
                        phone: cleanPhone,
                        message: message
                    });
                }
            }
        }
        
        const uniqueNumbers = [...new Set(phoneNumbers)];
        
        if (uniqueNumbers.length === 0) {
            console.log('⚠️  No phone numbers found in Apify results.');
            return;
        }

        // 5. Save business data to JSON file
        fs.writeFileSync(BUSINESS_DATA_FILE, JSON.stringify(businessData, null, 2));
        console.log(`💾 Saved business data to ${BUSINESS_DATA_FILE}`);

        // 6. Save custom messages
        let messagesContent = '';
        customMessages.forEach((item, index) => {
            messagesContent += `=== Message ${index + 1} for ${item.business} (${item.phone}) ===\n\n`;
            messagesContent += item.message;
            messagesContent += '\n\n' + '='.repeat(80) + '\n\n';
        });
        fs.writeFileSync(MESSAGES_FILE, messagesContent);
        console.log(`💾 Saved ${customMessages.length} custom messages to ${MESSAGES_FILE}`);

        // 7. Write phone numbers to phone_numbers.txt
        let existingNumbers = [];
        if (fs.existsSync(NUMBERS_FILE)) {
            const existingContent = fs.readFileSync(NUMBERS_FILE, 'utf8');
            existingNumbers = existingContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        }
        
        // Format: phone,name,address,category,rating,website
        const formattedBusinessData = businessData.map(business => 
            `${business.phone},${business.name},${business.address},${business.category},${business.rating},${business.website}`
        );
        
        const allBusinessData = [...new Set([...existingNumbers, ...formattedBusinessData])];
        fs.writeFileSync(NUMBERS_FILE, allBusinessData.join('\n') + '\n');
        
        console.log(`\n📊 SUMMARY:`);
        console.log(`✅ Total businesses found: ${businessData.length}`);
        console.log(`📞 New phone numbers: ${uniqueNumbers.length}`);
        console.log(`📄 Total entries in file: ${allBusinessData.length}`);
        console.log(`💬 Custom messages generated: ${customMessages.length}`);
        
        console.log(`\n📱 Sample phone numbers:`);
        uniqueNumbers.slice(0, 10).forEach((num, i) => console.log(`   ${i + 1}. ${num}`));
        
        console.log(`\n🏢 Sample business data (CSV format):`);
        formattedBusinessData.slice(0, 3).forEach((entry, i) => {
            console.log(`\n   ${i + 1}. ${entry}`);
        });
        
        console.log(`\n📝 Next steps:`);
        console.log(`1. Review business data: ${BUSINESS_DATA_FILE}`);
        console.log(`2. Review custom messages: ${MESSAGES_FILE}`);
        console.log(`3. Run WhatsApp bot: npm start`);
        console.log(`4. Phone numbers file now contains: phone,name,address,category,rating,website`);
        
    } catch (error) {
        console.error('❌ Error using Apify API:', error.message);
        if (error.response && error.response.data) {
            console.error(error.response.data);
        }
    }
}

if (require.main === module) {
    runApifyScraper();
} 