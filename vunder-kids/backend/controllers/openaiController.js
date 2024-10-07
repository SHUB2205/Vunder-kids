const OpenAI = require('openai');


const openai = new OpenAI({
	apiKey: 'pk-ebmfPrdfXCdnkynWddxUpLdpdWGhpoqPrBFAxlsUJQVCLJMZ',
	baseURL: "https://localhost:5000/v1",
});


const fetchData=require('../services/openai/fetchData.js')
// const siteLink=require('../services/openai/siteLinks.js')
const askOpenai=async(req,res)=>{
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
  