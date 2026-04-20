import React, { createContext, useState, useContext } from 'react';
import api from '../config/axios';
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
      const response = await api.get(API_ENDPOINTS.GET_MATCHES);
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
      const response = await api.post(API_ENDPOINTS.CREATE_MATCH, matchData);
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
      const response = await api.put(API_ENDPOINTS.UPDATE_SCORE(matchId), { scores });
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
      const response = await api.post(API_ENDPOINTS.JOIN_MATCH(matchId));
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
      const response = await api.get(API_ENDPOINTS.GET_SPORTS);
      setSports(response.data.sports);
      return response.data.sports;
    } catch (error) {
      console.error('Error fetching sports:', error);
      return [];
    }
  };

  const fetchFacilities = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.GET_FACILITIES);
      setFacilities(response.data.facilities);
      return response.data.facilities;
    } catch (error) {
      console.error('Error fetching facilities:', error);
      return [];
    }
  };

  /** Filter facilities by sport name and area without mutating context `facilities` (for create-match picker). */
  const searchFacilities = async ({ sport, city, state, location } = {}) => {
    try {
      const params = new URLSearchParams();
      if (sport) params.append('sport', sport);
      if (city) params.append('city', city);
      if (state) params.append('state', state);
      if (location) params.append('location', location);
      const qs = params.toString();
      const url = qs ? `${API_ENDPOINTS.GET_FACILITIES}?${qs}` : API_ENDPOINTS.GET_FACILITIES;
      const response = await api.get(url);
      return response.data.facilities || [];
    } catch (error) {
      console.error('Error searching facilities:', error);
      return [];
    }
  };

  const createFacility = async (facilityData) => {
    try {
      const response = await api.post(API_ENDPOINTS.CREATE_FACILITY, facilityData);
      setFacilities(prev => [response.data.facility, ...prev]);
      return { success: true, facility: response.data.facility };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create facility',
      };
    }
  };

  const suggestFacilities = async (nameQuery) => {
    if (!nameQuery || nameQuery.length < 2) return [];
    try {
      const url = `${API_ENDPOINTS.GET_FACILITIES}?name=${encodeURIComponent(nameQuery)}&limit=10`;
      const response = await api.get(url);
      return response.data.facilities || [];
    } catch (error) {
      console.error('Error suggesting facilities:', error);
      return [];
    }
  };

  const bookFacility = async (bookingData) => {
    try {
      const response = await api.post(API_ENDPOINTS.BOOK_FACILITY, bookingData);
      return { success: true, booking: response.data.booking };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to book facility' 
      };
    }
  };

  // Toggle like on match - like PWA MatchContext toggleLike
  const toggleLike = async (matchId) => {
    try {
      const response = await api.post(API_ENDPOINTS.LIKE_MATCH(matchId));
      setMatches(prev =>
        prev.map(match =>
          match._id === matchId ? { ...match, likes: response.data.likes } : match
        )
      );
      return { success: true, likes: response.data.likes, isLiked: response.data.isLiked };
    } catch (error) {
      console.error('Error toggling like:', error);
      return { success: false };
    }
  };

  // Comment on match
  const commentOnMatch = async (matchId, content) => {
    try {
      const response = await api.post(API_ENDPOINTS.COMMENT_MATCH(matchId), { content });
      setMatches(prev =>
        prev.map(match =>
          match._id === matchId 
            ? { ...match, comments: response.data.comments } 
            : match
        )
      );
      return { success: true, comment: response.data.comment };
    } catch (error) {
      console.error('Error commenting on match:', error);
      return { success: false };
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
        searchFacilities,
        createFacility,
        suggestFacilities,
        bookFacility,
        toggleLike,
        commentOnMatch,
        setMatches,
      }}
    >
      {children}
    </MatchContext.Provider>
  );
};
