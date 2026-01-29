import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const MatchContext = createContext();

export const useMatch = () => useContext(MatchContext);

export const MatchProvider = ({ children }) => {
  const [matches, setMatches] = useState([]);
  const [sports, setSports] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_ENDPOINTS.GET_MATCHES);
      setMatches(response.data.matches);
      return response.data.matches;
    } catch (error) {
      console.error('Error fetching matches:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createMatch = async (matchData) => {
    try {
      const response = await axios.post(API_ENDPOINTS.CREATE_MATCH, matchData);
      setMatches(prev => [response.data.match, ...prev]);
      return { success: true, match: response.data.match };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create match' 
      };
    }
  };

  const updateScore = async (matchId, scores) => {
    try {
      const response = await axios.put(API_ENDPOINTS.UPDATE_SCORE(matchId), { scores });
      setMatches(prev =>
        prev.map(match =>
          match._id === matchId ? { ...match, scores, status: 'score-requested' } : match
        )
      );
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  };

  const joinMatch = async (matchId) => {
    try {
      const response = await axios.post(API_ENDPOINTS.JOIN_MATCH(matchId));
      setMatches(prev =>
        prev.map(match =>
          match._id === matchId ? response.data.match : match
        )
      );
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to join match' 
      };
    }
  };

  const fetchSports = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.GET_SPORTS);
      setSports(response.data.sports);
      return response.data.sports;
    } catch (error) {
      console.error('Error fetching sports:', error);
      return [];
    }
  };

  const fetchFacilities = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.GET_FACILITIES);
      setFacilities(response.data.facilities);
      return response.data.facilities;
    } catch (error) {
      console.error('Error fetching facilities:', error);
      return [];
    }
  };

  const bookFacility = async (bookingData) => {
    try {
      const response = await axios.post(API_ENDPOINTS.BOOK_FACILITY, bookingData);
      return { success: true, booking: response.data.booking };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to book facility' 
      };
    }
  };

  return (
    <MatchContext.Provider
      value={{
        matches,
        sports,
        facilities,
        loading,
        fetchMatches,
        createMatch,
        updateScore,
        joinMatch,
        fetchSports,
        fetchFacilities,
        bookFacility,
        setMatches,
      }}
    >
      {children}
    </MatchContext.Provider>
  );
};
