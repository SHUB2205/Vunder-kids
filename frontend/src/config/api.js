const API_BASE_URL = 'http://localhost:5000/api';
const CHAT_BASE_URL = 'http://localhost:4000';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/login`,
  REGISTER: `${API_BASE_URL}/register`,
  VERIFY_EMAIL: `${API_BASE_URL}/verify-email`,
  GOOGLE_AUTH: `${API_BASE_URL}/auth/google`,
  
  // User
  GET_USER: `${API_BASE_URL}/user`,
  UPDATE_USER: `${API_BASE_URL}/edit/user`,
  GET_USER_BY_USERNAME: (username) => `${API_BASE_URL}/user/${username}`,
  FOLLOW_USER: `${API_BASE_URL}/follow`,
  UNFOLLOW_USER: `${API_BASE_URL}/unfollow`,
  
  // Posts
  GET_POSTS: `${API_BASE_URL}/post/posts`,
  CREATE_POST: `${API_BASE_URL}/post/create`,
  LIKE_POST: (postId) => `${API_BASE_URL}/post/like/${postId}`,
  COMMENT_POST: (postId) => `${API_BASE_URL}/post/comment/${postId}`,
  DELETE_POST: (postId) => `${API_BASE_URL}/post/delete/${postId}`,
  GET_USER_POSTS: (userId) => `${API_BASE_URL}/post/user/${userId}`,
  
  // Stories
  GET_STORIES: `${API_BASE_URL}/post/stories`,
  CREATE_STORY: `${API_BASE_URL}/post/story/create`,
  VIEW_STORY: (storyId) => `${API_BASE_URL}/post/story/view/${storyId}`,
  
  // Reels
  GET_REELS: `${API_BASE_URL}/reels`,
  CREATE_REEL: `${API_BASE_URL}/reels/create`,
  LIKE_REEL: (reelId) => `${API_BASE_URL}/reels/like/${reelId}`,
  
  // Matches
  GET_MATCHES: `${API_BASE_URL}/matches`,
  CREATE_MATCH: `${API_BASE_URL}/matches/create`,
  UPDATE_SCORE: (matchId) => `${API_BASE_URL}/matches/score/${matchId}`,
  JOIN_MATCH: (matchId) => `${API_BASE_URL}/matches/join/${matchId}`,
  
  // Search
  SEARCH_USERS: `${API_BASE_URL}/search/users`,
  SEARCH_NEWS: `${API_BASE_URL}/search/news`,
  SEARCH_SPORTS: `${API_BASE_URL}/search/sports`,
  
  // Facilities
  GET_FACILITIES: `${API_BASE_URL}/facilities`,
  BOOK_FACILITY: `${API_BASE_URL}/facilities/book`,
  
  // Sports
  GET_SPORTS: `${API_BASE_URL}/sport`,
  
  // Notifications
  GET_NOTIFICATIONS: `${API_BASE_URL}/notifications`,
  MARK_READ: (notifId) => `${API_BASE_URL}/notifications/read/${notifId}`,
  UPDATE_TOKEN: `${API_BASE_URL}/notifications/token`,
  
  // AI
  AI_CHAT: `${API_BASE_URL}/ai/chat`,
  AI_ADVICE: `${API_BASE_URL}/ai/advice`,
  
  // Chat
  CHAT_SOCKET: CHAT_BASE_URL,
  GET_MESSAGES: `${CHAT_BASE_URL}/api/messages`,
  GET_CONVERSATIONS: `${CHAT_BASE_URL}/api/messages/conversations`,
};

export { API_BASE_URL, CHAT_BASE_URL };
