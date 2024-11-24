import React, { useContext, useState } from 'react';
import { ReelContext } from './ReelContext';
import axios from 'axios';
import IsAuth from '../is-Auth/IsAuthContext';

const Backend_URL = 'http://localhost:5000';

const ReelState = ({ children }) => {
  const [reels, setReels] = useState([]);
  const [myReels, setMyReels] = useState([]);
  const [likedReels, setLikedReels] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token, user } = useContext(IsAuth);

  const createReel = async (reelData) => {
    try {
      const response = await axios.post(`${Backend_URL}/api/reels/create`, reelData, {
        headers: { token, 'Content-Type': 'multipart/form-data' },
      });
      return response.data.reel;
    } catch (error) {
      console.error('Error creating reel:', error);
      throw error;
    }
  };

  const getReels = async (isUser = false) => {
    try {
      setLoading(true);
      if (isUser && user) {
        const response = await axios.get(`${Backend_URL}/api/reels/reels?username=${user.userName}`);
        setMyReels(response.data.reels);
      } else {
        const response = await axios.get(`${Backend_URL}/api/reels/reels`,{headers : {token : token}});
        setReels(response.data.reels);
      }
    } catch (error) {
      console.error('Error fetching reels:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLikedReels = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${Backend_URL}/api/reels/likedReels`, {
        headers: { token },
      });
      setLikedReels(response.data.reels);
    } catch (error) {
      console.log('Error in fetching Liked Reels');
      setLikedReels([]);
    } finally {
      setLoading(false);
    }
  };




  const toggleLike = async (reelId) => {
    try {
      const response = await axios.put(`${Backend_URL}/api/reels/toggle-like/${reelId}`, {}, {
        headers: { token }
      });
      return response.data;
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  };

  const createComment = async (reelId, newComment) => {
    try {
      const response = await axios.post(`${Backend_URL}/api/reels/comment/${reelId}`,
        { content: newComment }, {
        headers: { token }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  };

  const toggleLikeComment = async (commentId) => {
    try {
      const response = await axios.put(`${Backend_URL}/api/reels/comment-like/${commentId}`, {}, {
        headers: { token }
      });
      return response.data;
    } catch (error) {
      console.error('Error toggling comment like:', error);
      throw error;
    }
  };

  return (
    <ReelContext.Provider value={{
      reels,
      getReels,
      setReels,
      loading,
      setLoading,
      createReel,
      toggleLike,
      createComment,
      myReels,
      toggleLikeComment,
      likedReels,
      getLikedReels
    }}>
      {children}
    </ReelContext.Provider>
  );
};

export default ReelState;