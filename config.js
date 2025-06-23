// Configuration file for WhatsApp Bot and Business Finder

module.exports = {
    // WhatsApp Bot Configuration
    whatsapp: {
        numbersFile: 'phone_numbers.txt',
        messageFile: 'message.txt',
        delayBetweenMessages: 2000, // 2 seconds delay (safer)
        countryCode: '977', // Country code for Nepal
        maxMessagesPerSession: 10, // Maximum messages per session
        randomDelayRange: 2000 // Random delay between 5-7 seconds
    },

    // Business Finder Configuration
    businessFinder: {
        location: 'tokha, kathmandu', // Updated location
        maxResultsPerSearch: 5, // Maximum businesses to process per search
        delayBetweenSearches: 3000, // Delay between different search queries
        
        // Search queries - customize these for your needs
        searchQueries: [
            'restaurant',
            'hotel',
            'shop',
            'business',
            'cafe',
            'store'
        ],
        
        // Alternative search queries for different business types
        // Uncomment and modify as needed:
        /*
        searchQueries: [
            'restaurant tokha',
            'hotel kathmandu',
            'shop tokha',
            'business kathmandu',
            'cafe tokha',
            'store kathmandu'
        ],
        */
        
        // Browser settings
        browser: {
            headless: false, // Set to true for production (no visible browser)
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    },

    // WebGhar Business Configuration
    webGhar: {
        companyName: 'WebGhar',
        service: 'Premium Website Development',
        features: [
            'Clean & Professional Design',
            'Mobile-Friendly',
            'Fast Loading',
            'SEO Optimized',
            'Easy to Manage',
            'Affordable Pricing'
        ],
        pricing: 'affordable',
        contactInfo: {
            phone: '+9779765971233', // Your contact number
            email: 'info@webghar.com', // Your email
            website: 'www.webghar.com' // Your website
        }
    },

    // Safety settings
    safety: {
        maxTotalBusinesses: 50, // Maximum total businesses to process
        waitBetweenSessions: 3600000, // 1 hour wait between sessions (in milliseconds)
        enableRandomDelays: true, // Enable random delays to avoid detection
        filterBusinessesWithoutWebsites: true // Only target businesses without websites
    }
}; 