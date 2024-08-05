import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const SERVER_URL = "http://localhost:5000";

const Verify = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const email = location.state?.email;

  const handleResendVerification = async () => {
    try {
      await axios.post(`${SERVER_URL}/api/send-verification-email`, { email });
      setMessage('Verification email resent. Please check your inbox.');
    } catch (error) {
      setMessage('Error resending verification email. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <h2>Verify Your Email</h2>
      <p>We've sent a verification email to {email}. Please check your inbox and click the verification link.</p>
      <button onClick={handleResendVerification}>Resend Verification Email</button>
      {message && <p>{message}</p>}
      <button onClick={() => navigate('/login')}>Go to Login</button>
    </div>
  );
};

export default Verify;