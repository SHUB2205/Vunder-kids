// Local development API URLs
const API_BASE_URL = 'http://10.226.171.40:5000/api';
const CHAT_BASE_URL = 'http://10.226.171.40:5000';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  VERIFY_EMAIL: `${API_BASE_URL}/auth/verify-email`,
  GOOGLE_AUTH: `${API_BASE_URL}/auth/google`,
  APPLE_AUTH: `${API_BASE_URL}/auth/apple`,
  
  // User
  GET_USER: `${API_BASE_URL}/user`,
  UPDATE_USER: `${API_BASE_URL}/user`,
  GET_USER_BY_ID: (userId) => `${API_BASE_URL}/user/${userId}`,
  FOLLOW_USER: `${API_BASE_URL}/user/follow`,
  UNFOLLOW_USER: `${API_BASE_URL}/user/unfollow`,
  GET_FOLLOWERS: (userId) => `${API_BASE_URL}/user/${userId}/followers`,
  GET_FOLLOWING: (userId) => `${API_BASE_URL}/user/${userId}/following`,
  
  // Posts
  GET_POSTS: `${API_BASE_URL}/post/posts`,
  CREATE_POST: `${API_BASE_URL}/post/create`,
  LIKE_POST: (postId) => `${API_BASE_URL}/post/like/${postId}`,
  COMMENT_POST: (postId) => `${API_BASE_URL}/post/comment/${postId}`,
  DELETE_POST: (postId) => `${API_BASE_URL}/post/delete/${postId}`,
  GET_USER_POSTS: (userId) => `${API_BASE_URL}/post/user/${userId}`,
  
  // Stories
  GET_STORIES: `${API_BASE_URL}/story`,
  CREATE_STORY: `${API_BASE_URL}/story/create`,
  VIEW_STORY: (storyId) => `${API_BASE_URL}/story/view/${storyId}`,
  
  // Reels
  GET_REELS: `${API_BASE_URL}/reels`,
  CREATE_REEL: `${API_BASE_URL}/reels/create`,
  LIKE_REEL: (reelId) => `${API_BASE_URL}/reels/like/${reelId}`,
  
  // Matches
  GET_MATCHES: `${API_BASE_URL}/matches`,
  GET_MATCH: (matchId) => `${API_BASE_URL}/matches/${matchId}`,
  CREATE_MATCH: `${API_BASE_URL}/matches/create`,
  UPDATE_SCORE: (matchId) => `${API_BASE_URL}/matches/score/${matchId}`,
  JOIN_MATCH: (matchId) => `${API_BASE_URL}/matches/join/${matchId}`,
  
  // Search
  SEARCH: `${API_BASE_URL}/search`,
  SEARCH_USERS: `${API_BASE_URL}/search/users`,
  SEARCH_NEWS: `${API_BASE_URL}/search/news`,
  SEARCH_SPORTS: `${API_BASE_URL}/search/sports`,
  
  // Live Scores - matching PWA scoreRoutes.js
  GET_LIVE_SCORES: (sport) => `${API_BASE_URL}/scores/live/${sport}`,
  GET_SCHEDULED_SCORES: (sport, date) => `${API_BASE_URL}/scores/scheduled/${sport}/${date}`,
  
  // Facilities
  GET_FACILITIES: `${API_BASE_URL}/facilities`,
  GET_FACILITY: (facilityId) => `${API_BASE_URL}/facilities/${facilityId}`,
  BOOK_FACILITY: `${API_BASE_URL}/facilities/book`,
  
  // Sports
  GET_SPORTS: `${API_BASE_URL}/sport`,
  
  // Notifications
  GET_NOTIFICATIONS: `${API_BASE_URL}/notifications`,
  MARK_READ: (notifId) => `${API_BASE_URL}/notifications/read/${notifId}`,
  MARK_ALL_READ: `${API_BASE_URL}/notifications/read-all`,
  UPDATE_TOKEN: `${API_BASE_URL}/notifications/token`,
  
  // AI
  AI_CHAT: `${API_BASE_URL}/ai/chat`,
  AI_ADVICE: `${API_BASE_URL}/ai/advice`,
  
  // Messages
  GET_MESSAGES: `${API_BASE_URL}/messages`,
  GET_CONVERSATIONS: `${API_BASE_URL}/messages/conversations`,
  SEND_MESSAGE: `${API_BASE_URL}/messages/send`,
};

export { API_BASE_URL, CHAT_BASE_URL };
