const OpenAI = require('openai');
const Redis = require('ioredis');
const fetchData = require('../services/openai/fetchData.js');

// Initialize OpenAI and Redis
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Securely load API key from environment variables
});

const redis = new Redis("redis://default:pwn8XQYCDpDazn9Jw4S2e0GOdWAxtneS@redis-17527.c74.us-east-1-4.ec2.redns.redis-cloud.com:17527");

// Function to interact with OpenAI API
const askOpenai = async (req, res) => {
  try {
    const { question } = req.body;
    const userId = req.user.id; // Assuming user ID is passed via req.user

    // Fetch user data from MongoDB (for user personalization)
    const userData = await fetchData(userId);
    if (!userData) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Construct a personalized system prompt
    const systemMessage = `
      You are a helpful assistant. The user is ${userData.name || "an anonymous user"}, 
      Using the following data: ${JSON.stringify(userData)}. 
      Assist the user based on their profile.
    `;

    // Fetch conversation history from Redis
    let conversationHistory = await redis.get(userId);
    if (conversationHistory) {
      conversationHistory = JSON.parse(conversationHistory);
    } else {
      conversationHistory = []; // Initialize an empty history if not found
    }

    // Add the user's current question to the conversation history
    conversationHistory.push({ role: 'user', content: question });

    // Construct the OpenAI messages array with system and conversation history
    const messages = [
      { role: 'system', content: systemMessage },
      ...conversationHistory,
    ];

    // Call OpenAI API for a response
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // You can change this to another model if necessary
      messages: messages,
    });

    const botResponse = response.choices[0].message.content;
    // console.log(userId);
    // Append the AI's response to the conversation history
    conversationHistory.push({ role: 'assistant', content: botResponse });

    // Save updated conversation history in Redis with a TTL (e.g., 1 hour)
    await redis.set(userId, JSON.stringify(conversationHistory), 'EX', 3600);

    // Return the AI's response to the frontend
    res.json({ reply: botResponse });
  } catch (error) {
    console.error('Error interacting with OpenAI:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  askOpenai,
};
