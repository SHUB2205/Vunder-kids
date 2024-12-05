const OpenAI = require('openai');

const openai = new OpenAI({
        apiKey: "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"
 });


 // const siteLink=require('../services/openai/siteLinks.js')
 const askOpenai=async(req,res)=>{
    const fetchData=require('../services/openai/fetchData.js');
    try {
        const { question } = req.body; // Assuming userId, siteLink, and the user's question are sent from the client
        const userId= req.user.id;
        
        // Fetch user data from MongoDB
        const userData = await fetchData(userId);

        if (!userData) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Format the prompt using the user data, site link, and user question
        // const prompt = `
        //     Using the following data: ${JSON.stringify(userData)}. 
        //     Here is the site link: ${siteLink}. 
        //     The user has asked the following question: "${question}". 
        //     Please provide a detailed response.
        // `;

        const prompt = `
            Using the following data: ${JSON.stringify(userData)}. 
            The user has asked the following question: "${question}". 
            Please provide a detailed response.
        `;

        // Send the prompt to OpenAI
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo', // or whichever model you want to use
            messages: [{ role: 'user', content: prompt }],
        });

        // Send the OpenAI response back to the client
        res.json(response.choices[0].message.content);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    askOpenai
  };
  