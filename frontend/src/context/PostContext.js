import React, { createContext, useState, useContext } from 'react';
import api from '../config/axios';
import { API_ENDPOINTS } from '../config/api';

const PostContext = createContext();

export const usePost = () => useContext(PostContext);

export const PostProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = async (page = 1) => {
    try {
      setLoading(true);
      const response = await api.get(`${API_ENDPOINTS.GET_POSTS}?page=${page}`);
      if (page === 1) {
        setPosts(response.data.posts);
      } else {
        setPosts(prev => [...prev, ...response.data.posts]);
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching posts:', error);
      return { posts: [] };
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (postData) => {
    try {
      const formData = new FormData();
      
      if (postData.media) {
        formData.append('media', {
          uri: postData.media.uri,
          type: postData.media.type || 'image/jpeg',
          name: postData.media.fileName || 'media.jpg',
        });
      }
      
      if (postData.content) formData.append('content', postData.content);
      if (postData.title) formData.append('title', postData.title);
      if (postData.tags) formData.append('tags', JSON.stringify(postData.tags));

      const response = await api.post(API_ENDPOINTS.CREATE_POST, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setPosts(prev => [response.data.post, ...prev]);
      return { success: true, post: response.data.post };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create post' 
      };
    }
  };

  const likePost = async (postId) => {
    try {
      await api.post(API_ENDPOINTS.LIKE_POST(postId));
      setPosts(prev => 
        prev.map(post => 
          post._id === postId 
            ? { ...post, likes: post.likes + 1, isLiked: true }
            : post
        )
      );
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  };

  const commentOnPost = async (postId, content) => {
    try {
      const response = await api.post(API_ENDPOINTS.COMMENT_POST(postId), { content });
      setPosts(prev =>
        prev.map(post =>
          post._id === postId
            ? { ...post, comments: [...post.comments, response.data.comment] }
            : post
        )
      );
      return { success: true, comment: response.data.comment };
    } catch (error) {
      return { success: false };
    }
  };

  const deletePost = async (postId) => {
    try {
      await api.delete(API_ENDPOINTS.DELETE_POST(postId));
      setPosts(prev => prev.filter(post => post._id !== postId));
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  };

  const fetchStories = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.GET_STORIES);
      setStories(response.data.stories);
      return response.data.stories;
    } catch (error) {
      console.error('Error fetching stories:', error);
      return [];
    }
  };

  const createStory = async (storyData) => {
    try {
      const formData = new FormData();
      formData.append('media', {
        uri: storyData.media.uri,
        type: storyData.media.type || 'image/jpeg',
        name: storyData.media.fileName || 'story.jpg',
      });

      const response = await api.post(API_ENDPOINTS.CREATE_STORY, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setStories(prev => [response.data.story, ...prev]);
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  };

  const viewStory = async (storyId) => {
    try {
      await api.post(API_ENDPOINTS.VIEW_STORY(storyId));
    } catch (error) {
      console.error('Error viewing story:', error);
    }
  };

  const fetchReels = async (page = 1) => {
    try {
      const response = await api.get(`${API_ENDPOINTS.GET_REELS}?page=${page}`);
      if (page === 1) {
        setReels(response.data.reels);
      } else {
        setReels(prev => [...prev, ...response.data.reels]);
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching reels:', error);
      return { reels: [] };
    }
  };

  const createReel = async (reelData) => {
    try {
      const formData = new FormData();
      formData.append('video', {
        uri: reelData.video.uri,
        type: 'video/mp4',
        name: 'reel.mp4',
      });
      if (reelData.caption) formData.append('caption', reelData.caption);

      const response = await api.post(API_ENDPOINTS.CREATE_REEL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setReels(prev => [response.data.reel, ...prev]);
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  };

  const likeReel = async (reelId) => {
    try {
      await api.post(API_ENDPOINTS.LIKE_REEL(reelId));
      setReels(prev =>
        prev.map(reel =>
          reel._id === reelId
            ? { ...reel, likes: reel.likes + 1, isLiked: true }
            : reel
        )
      );
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  };

  return (
    <PostContext.Provider
      value={{
        posts,
        stories,
        reels,
        loading,
        refreshing,
        fetchPosts,
        createPost,
        likePost,
        commentOnPost,
        deletePost,
        fetchStories,
        createStory,
        viewStory,
        fetchReels,
        createReel,
        likeReel,
        setPosts,
        setRefreshing,
      }}
    >
      {children}
    </PostContext.Provider>
  );
};
