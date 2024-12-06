import React, { useContext, useEffect, useState } from 'react';
import { ProfileContext } from './ProfileContext';
import axios from 'axios';
import IsAuth from '../is-Auth/IsAuthContext';

const Backend_URL = process.env.REACT_APP_BACKEND_URL;

const ProfileState = ({ children }) => {
    const {token , user} = useContext(IsAuth);
    const [profile,setProfile] = useState(null);
    const [userPosts , setUserPosts] = useState([]);
    const [loading,setLoading] = useState(false);
    const [userReels,setUserReels] = useState([]);


    const getProfile = async (username) => {
      try {
        if (!username ||( user && username === user.userName)) {
          const response = await axios.get(`${Backend_URL}/api/getUser/${user.userName}`,{headers:{token}});
          setProfile(response.data);
        } else if (username) {
          const response = await axios.get(`${Backend_URL}/api/getUser/${username}`,{headers:{token}});
          setProfile(response.data);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } 
    };
    
  

    const updateUser = async (userData) => {
      try {
        const response = await axios.put(`${Backend_URL}/api/edit-profile`, userData, {
          headers: {token,'Content-Type': 'multipart/form-data'},
        });
        const message = response.data.message;
        console.log(message);
      } catch (error) {
        console.error('Error creating post:', error);
        throw error;
      }
    };
 
    const getUserPosts = async (username) => {
      try {
        setLoading(true);
        const response = await axios.get(`${Backend_URL}/api/post/posts/${username}`);
        setUserPosts(response.data.posts);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setUserPosts([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    const getUserReels = async (username) => {
      try {
        setLoading(true);
        const response = await axios.get(`${Backend_URL}/api/reels/reels?username=${username}`);
        setUserReels(response.data.reels);
      } catch (error) {
        console.error('Error fetching reels:', error);
      } finally {
        setLoading(false);
      }
    };

    const toggleFollow = async (userId) => {
      try {
        console.log(userId,token)
        const response = await axios.put(`${Backend_URL}/api/post/toggle-follow`, { followId : userId },{headers:{token}});
        console.log('Successfully toggled follow:', response.data);
      } catch (error) {
        console.error('Error toggling follow:', error);
      }
    };

    const fetchCompletedMatches = async (username) => {
      try {
          const response = await axios.get(`${Backend_URL}/api/matches/completed-matches/${username ? username : user?.userName}`
            ,{headers:{token}}
          );
          return response.data;
      } catch (err) {
          console.log(err);
      }
      finally{
        setLoading(false);
      }
  };

  return (
    <ProfileContext.Provider value={{
        profile,
        getProfile,
        getUserPosts,
        userPosts,
        userReels,
        getUserReels,
        toggleFollow,
        setProfile,
        updateUser,
        fetchCompletedMatches
    }}>
      {children}
    </ProfileContext.Provider>
  );
};

export default ProfileState;
