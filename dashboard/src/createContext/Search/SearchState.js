import React, { useState } from 'react';
import { SearchContext } from './SearchContext';
import axios from 'axios';
import { useContext } from 'react';
import IsAuth from '../is-Auth/IsAuthContext';

const Backend_URL = 'http://localhost:5000';

const SearchState = ({ children }) => {
  const [searchResults, setSearchResults] = useState({ users: [], posts: [] });
  const [loading, setLoading] = useState(false);
  const { token } = useContext(IsAuth);

  // Search functionality
  const performSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults({ users: [], posts: [] });
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${Backend_URL}/api/search/search?query=${query}`, {
        headers: { token }
      });
      
      setSearchResults({
        users: response.data.users || [],
        posts: response.data.posts || []
      });
    } catch (error) {
      console.error('Error performing search:', error);
      setSearchResults({ users: [], posts: [] });
    } finally {
      setLoading(false);
    }
  };

  // Clear search results
  const clearSearch = () => {
    setSearchResults({ users: [], posts: [] });
  };

  return (
    <SearchContext.Provider value={{
      searchResults,
      loading,
      performSearch,
      clearSearch
    }}>
      {children}
    </SearchContext.Provider>
  );
};

export default SearchState; 