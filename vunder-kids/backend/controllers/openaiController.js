const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: "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"
});

// In-memory storage for conversation history
const conversationHistory = {};

const askOpenai = async (req, res) => {
    const fetchData = require('../services/openai/fetchData.js');
    try {
        const { question } = req.body;
        const userId = req.user.id;

        // Fetch user data from MongoDB
        const userData = await fetchData(userId);

        if (!userData) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Initialize or fetch conversation history
        if (!conversationHistory[userId]) {
            conversationHistory[userId] = [];
        }

        // Add the user's current question to the conversation history
        conversationHistory[userId].push({ role: 'user', content: question });

        // Construct a personalized system prompt using user data
        const systemMessage = `
            You are a helpful assistant. The user is ${userData.name || "an anonymous user"}, 
             Using the following data: ${JSON.stringify(userData)}. 
            Assist the user based on their profile.
        `;

        // Construct the OpenAI messages array
        const messages = [
            { role: 'system', content: systemMessage }, // Personalized system message
            ...conversationHistory[userId]
        ];

        // Call OpenAI API
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo', // Replace with your desired model
            messages: messages,
        });

        // Extract and append the AI's response to the conversation history
        const botResponse = response.choices[0].message.content;
        conversationHistory[userId].push({ role: 'assistant', content: botResponse });
        // console.log(botResponse);
        // Return the response to the user
        res.json({ reply: botResponse });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    askOpenai,
};
