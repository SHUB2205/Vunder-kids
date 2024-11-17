import React, { useEffect, useState } from "react";
import IsAuth from "./IsAuthContext"
export default function SearchModalState(props) {
    const [token, setToken] = useState(null);

    // On component mount, get the token from sessionStorage
    useEffect(() => {
      const storedToken = sessionStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
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
    
  return (
    <>
      <IsAuth.Provider value={{ token,setAuthToken }}>
        {props.children}
      </IsAuth.Provider>
    </>
  );
}

//  reminde to use the context in the component
    //   {/* Optionally, provide a way to update or clear the token */}
    //   <button onClick={() => setAuthToken(null)}>Clear Token</button>