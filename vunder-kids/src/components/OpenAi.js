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
            const res = await axios.post('http://localhost:5000/api/ai/askOpenAi', {
                question: question,
            });

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
