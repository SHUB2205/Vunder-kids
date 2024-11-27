// To Do : Token Exception Handling for non-logined users by tostify

import React, { useContext, useState } from 'react';
import { PostContext, CommentContext } from './PostContext';
import axios from 'axios';
import IsAuth from '../is-Auth/IsAuthContext';

const Backend_URL = 'http://localhost:5000';

const PostState = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [Myposts, setMyPosts] = useState([]);
  const [Likedposts, setLikedPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const {token,user} = useContext(IsAuth);

  const createPost = async (postData) => {
    try {
      const response = await axios.post(`${Backend_URL}/api/post/create`, postData, {
        headers: {token,'Content-Type': 'multipart/form-data'},
      });
      const newPost = response.data.post
      setPosts(prevPosts => [{...newPost,creator:{avatar : user.avatar , userName: user.userName}}, ...prevPosts]);
      return response.data;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  };

  const getPosts = async (isUser = false) => {
    try {
      setLoading(true);
      if (isUser && user){
        const response = await axios.get(`${Backend_URL}/api/post/posts/${user.userName}`);
        setMyPosts(response.data.posts);
      }
      else{
        const response = await axios.get(`${Backend_URL}/api/post/posts`);
        setPosts(response.data.posts);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };


  const getLikedPosts = async() => {
    try{
      setLoading(true);
      const response = await axios.get(`${Backend_URL}/api/post/likedPosts`,{
        headers: {token},
      }); 
      setLikedPosts(response.data.posts);
    }
    catch (error){
      console.log('Error in fetching Liked Posts');
      setLikedPosts([]);
    }
    finally{
      setLoading(false);
    }
  }

  const getPostById = async (postId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${Backend_URL}/api/post/post/${postId}`);
      return response.data.post;
    } catch (error) {
      console.error('Error Post Details:', error);
      throw error;
    }
    finally {
      setLoading(false);
    }
  };

  const toggleLike = async (postId) => {
    try {
      const response = await axios.put(`${Backend_URL}/api/post/like-post/${postId}`, {}, {
        headers: { token }
      });
      return response.data;
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  };

  const createComment = async (postId,newComment) => {
    try {
      const response = await axios.post(`${Backend_URL}/api/post/comment/${postId}`,
        {content : newComment}, {
        headers: { token }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  };

  return (
    <PostContext.Provider value={{ 
      posts, // Added posts to the context
      getPosts, 
      setPosts, 
      loading, 
      setLoading,
      createPost,
      toggleLike,
      getPostById,
      createComment,
      Myposts,
      getLikedPosts,
      Likedposts
    }}>
      {children}
    </PostContext.Provider>
  );
};

export default PostState;
