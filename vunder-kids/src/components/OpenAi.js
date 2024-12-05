import React,{useState} from 'react';
import axios from 'axios';
const OpenAi = () => {
    const [question, setQuestion] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3M2Q0NDY4ZWY1NmExMzAxNDRiNTQ3MyIsImlzVmVyaWZpZWQiOnRydWUsImlhdCI6MTczMzQxNDcxMCwiZXhwIjoxNzM2MDA2NzEwfQ.8gVcOLsKw1TerLr_BbizIplPO5-pl2afSnHKDqSD-ZU"; // Replace this with the actual token (e.g., from localStorage, state, or props)
        
            const res = await axios.post(
                'http://localhost:5000/api/ai/askOpenAi',
                { question: question },
                {
                    headers: {
                      token, // Include the token in the Authorization header
                    },
                }
            );
        
            setResponse(res.data); // Assuming your backend returns the answer directly
            setQuestion(''); // Clear the input field
        } catch (err) {
            console.error(err);
            setError('Failed to get a response. Please try again.');
        } finally {
            setLoading(false);
        }
        
    };

    return (
        <div>
            <h2>Ask a Question</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Type your question here..."
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Loading...' : 'Submit'}
                </button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {response && <div>
                <h3>Response:</h3>
                <p>{response}</p>
            </div>}
        </div>
    );
};

export default OpenAi;
