const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
require('dotenv').config();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ||AIzaSyBJ3K2r6d80GfACt08OZZLA1O5Hef3hjwY );
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" }); // Use "gemini-pro" here
const lmodel = genAI
// Function to fetch drug data from OpenFDA
async function fetchDrugData(drugName) {
    try {
        const response = await axios.get(`https://api.fda.gov/drug/label.json?search=brand_name:${drugName}&limit=1`);
        if (response.data.results && response.data.results.length > 0) {
            return response.data.results[0];
        }
        return null;
    } catch (error) {
        console.error('Error fetching drug data:', error.message);
        return null;
    }
}

// Function to determine if the message is about drugs
function isDrugRelated(message) {
    const drugKeywords = ['medicine', 'drug', 'medication', 'pill', 'tablet', 'capsule', 'prescription'];
    return drugKeywords.some(keyword => message.toLowerCase().includes(keyword));
}

// Helper to extract drug name from message
function extractDrugName(message) {
    const commonWords = ['what', 'about', 'tell', 'me', 'information', 'can', 'you', 'give', 'details', 'the', 'of', 'and'];
    const words = message.match(/\b[A-Za-z]+\b/g) || [];
    return words.find(word => !commonWords.includes(word.toLowerCase()));
}

// Main chat function
const chatWithBot = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        let prompt = message; // Default prompt is just the message

        if (isDrugRelated(message)) {
            const drugName = extractDrugName(message);

            if (drugName) {
                const drugData = await fetchDrugData(drugName);

                if (drugData) {
                    prompt = `Based on the following drug information, provide a clear and concise response to the user's query: "${message}"
Drug Information:
${JSON.stringify(drugData, null, 2)}`;
                } else {
                    return res.status(404).json({ error: `No drug data found for "${drugName}"` });
                }
            }
        }

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return res.json({ response: text });

    } catch (error) {
        console.error('Error in chat:', error);
        return res.status(500).json({ error: 'An error occurred while processing your request', details: error.message });
    }
};

module.exports = {
    chatWithBot
};
