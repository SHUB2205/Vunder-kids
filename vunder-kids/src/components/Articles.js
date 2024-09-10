import React, { useEffect, useState } from "react";
import "./Articles.css";
import { requestPermission } from "../notification/requestPermission";
import { setupOnMessage } from "../notification/onMessage";
const Articles = () => {
  const [permission, setPermission] = useState(false);
  const [token, setToken] = useState(undefined);

  useEffect(() => {
    // Call requestPermission inside useEffect and update the state
    const fetchPermission = async () => {
      const result = await requestPermission();
      setPermission(result.permission);
      setToken(result.token);
    };
    fetchPermission();
    setupOnMessage(); 
    // eslint-disable-next-line
  }, []);

  return (
    <section id="articles" className="articles">
      <h2>Articles</h2>
      <p>Coming soon...</p>
    </section>
  );
};

export default Articles;
