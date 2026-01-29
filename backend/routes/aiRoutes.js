const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// @route   POST /api/ai/chat
// @desc    Chat with AI assistant
router.post('/chat', auth, async (req, res) => {
  try {
    const { message, context } = req.body;

    // Build context-aware system prompt
    const systemPrompt = `You are a helpful sports AI assistant for the Fisiko app. 
    You help users with sports training, match preparation, nutrition advice, and finding teammates.
    
    User Context:
    - Name: ${context?.userName || 'User'}
    - Sports interests: ${context?.passions?.map(p => `${p.name} (${p.skillLevel})`).join(', ') || 'Not specified'}
    - Recent activity: ${context?.recentMatches?.length || 0} recent matches
    
    Be friendly, encouraging, and provide actionable advice. Keep responses concise but helpful.
    If asked about injuries or medical issues, always recommend consulting a professional.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || 
      'I apologize, but I couldn\'t process your request. Please try again.';

    res.json({ response });
  } catch (error) {
    console.error('AI Chat error:', error);
    
    // Fallback response if OpenAI fails
    const fallbackResponses = {
      training: 'For effective training, focus on consistency, proper warm-up, and gradual progression. Would you like specific drills for your sport?',
      nutrition: 'Good nutrition is key! Focus on balanced meals with protein, complex carbs, and plenty of hydration.',
      default: 'I\'m here to help with your sports journey! Ask me about training, nutrition, match preparation, or finding teammates.'
    };

    const message = req.body.message?.toLowerCase() || '';
    let response = fallbackResponses.default;
    
    if (message.includes('train') || message.includes('practice')) {
      response = fallbackResponses.training;
    } else if (message.includes('eat') || message.includes('nutrition') || message.includes('diet')) {
      response = fallbackResponses.nutrition;
    }

    res.json({ response });
  }
});

// @route   POST /api/ai/advice
// @desc    Get personalized advice based on user data
router.post('/advice', auth, async (req, res) => {
  try {
    const { type } = req.body; // training, nutrition, recovery, etc.
    const user = req.user;

    const prompts = {
      training: `Based on the user's sports (${user.passions?.map(p => p.name).join(', ')}), 
        provide 3 specific training tips for their skill levels.`,
      nutrition: `Provide nutrition advice for an athlete interested in ${user.passions?.map(p => p.name).join(', ')}.`,
      recovery: `Suggest recovery strategies for someone who plays ${user.passions?.map(p => p.name).join(', ')}.`,
    };

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { 
          role: 'system', 
          content: 'You are a sports coach providing personalized advice. Be specific and actionable.' 
        },
        { role: 'user', content: prompts[type] || prompts.training }
      ],
      max_tokens: 300,
    });

    res.json({ advice: completion.choices[0]?.message?.content });
  } catch (error) {
    console.error('AI Advice error:', error);
    res.status(500).json({ message: 'Failed to generate advice' });
  }
});

module.exports = router;
