import React, { useEffect, useState } from "react";
import IsAuth from "./IsAuthContext";
import axios from "axios";

const Backend_URL = 'http://localhost:5000';

export default function SearchModalState(props) {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user,setUser] = useState(null);

    // On component mount, get the token from sessionStorage
    useEffect(() => {
      const storedToken = sessionStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
      }
      if (token) {
        fetchUserInfo();
      }
    }, []);
  
    // Store token in sessionStorage when it's updated
    const setAuthToken = (newToken) => {
      setToken(newToken);
      if (newToken) {
        sessionStorage.setItem('token', newToken);
      } else {
        sessionStorage.removeItem('token');
      }
    };

    const fetchUserInfo = async () => {
      try {
        const response = await axios.get(`${Backend_URL}/api/users/myInfo`,{
          headers: { token }
        });
        setUser(response.data);
      }
      catch (error) {
        console.error('Error toggling like:', error);
        throw error;
      }
    };
    
  return (
    <>
      <IsAuth.Provider value={{ token,setAuthToken,user }}>
        {props.children}
      </IsAuth.Provider>
    </>
  );
}

//  reminde to use the context in the component
    //   {/* Optionally, provide a way to update or clear the token */}
    //   <button onClick={() => setAuthToken(null)}>Clear Token</button>