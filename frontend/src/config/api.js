// Production API URLs
const API_BASE_URL = 'https://vunder-kids-production.up.railway.app/api';
const CHAT_BASE_URL = 'https://vunder-kids-production.up.railway.app';

// Local development URLs (uncomment for local testing)
// const LOCAL_IP = '100.110.57.70';
// const API_BASE_URL = `http://${LOCAL_IP}:5001/api`;
// const CHAT_BASE_URL = `http://${LOCAL_IP}:5001`;

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  VERIFY_EMAIL: `${API_BASE_URL}/auth/verify-email`,
  GOOGLE_AUTH: `${API_BASE_URL}/auth/google`,
  APPLE_AUTH: `${API_BASE_URL}/auth/apple`,
  REGISTER_OWNER: `${API_BASE_URL}/auth/register-owner`,
  LOGIN_OWNER: `${API_BASE_URL}/auth/login-owner`,
  
  // User
  GET_USER: `${API_BASE_URL}/user`,
  UPDATE_USER: `${API_BASE_URL}/user`,
  GET_USER_BY_ID: (userId) => `${API_BASE_URL}/user/${userId}`,
  GET_USER_STATS: (userId) => `${API_BASE_URL}/user/${userId}/stats`,
  GET_SUGGESTIONS: `${API_BASE_URL}/user/suggestions`,
  FOLLOW_USER: `${API_BASE_URL}/user/follow`,
  UNFOLLOW_USER: `${API_BASE_URL}/user/unfollow`,
  REGISTER_PUSH_TOKEN: `${API_BASE_URL}/user/push-token`,
  GET_FOLLOWERS: (userId) => `${API_BASE_URL}/user/${userId}/followers`,
  GET_FOLLOWING: (userId) => `${API_BASE_URL}/user/${userId}/following`,
  DELETE_ACCOUNT: `${API_BASE_URL}/user/delete-account`,
  UPDATE_LOCATION: `${API_BASE_URL}/user/location`,
  GET_NEARBY_USERS: `${API_BASE_URL}/user/nearby`,
  UPDATE_MAP_VISIBILITY: `${API_BASE_URL}/user/map-visibility`,
  
  // Matches
  GET_MATCHES: `${API_BASE_URL}/matches`,
  GET_MY_MATCHES: `${API_BASE_URL}/matches/my`,
  GET_PENDING_MATCHES: `${API_BASE_URL}/matches/pending-approval`,
  GET_MATCH: (matchId) => `${API_BASE_URL}/matches/${matchId}`,
  CREATE_MATCH: `${API_BASE_URL}/matches/create`,
  UPDATE_SCORE: (matchId) => `${API_BASE_URL}/matches/score/${matchId}`,
  JOIN_MATCH: (matchId) => `${API_BASE_URL}/matches/join/${matchId}`,
  APPROVE_MATCH: (matchId) => `${API_BASE_URL}/matches/${matchId}/approve`,
  DECLINE_MATCH: (matchId) => `${API_BASE_URL}/matches/${matchId}/decline`,
  START_MATCH: (matchId) => `${API_BASE_URL}/matches/${matchId}/start`,
  COMPLETE_MATCH: (matchId) => `${API_BASE_URL}/matches/${matchId}/complete`,
  VERIFY_SCORE: (matchId) => `${API_BASE_URL}/matches/${matchId}/verify-score`,
  ADD_MATCH_MEDIA: (matchId) => `${API_BASE_URL}/matches/${matchId}/media`,
  DELETE_MATCH_MEDIA: (matchId, mediaId) => `${API_BASE_URL}/matches/${matchId}/media/${mediaId}`,
  LIKE_MATCH: (matchId) => `${API_BASE_URL}/matches/${matchId}/like`,
  COMMENT_MATCH: (matchId) => `${API_BASE_URL}/matches/${matchId}/comment`,
  
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
  GET_FEATURED_FACILITIES: `${API_BASE_URL}/facilities/featured`,
  GET_NEARBY_FACILITIES: `${API_BASE_URL}/facilities/nearby`,
  GET_FACILITY: (facilityId) => `${API_BASE_URL}/facilities/${facilityId}`,
  GET_FACILITY_AVAILABILITY: (facilityId) => `${API_BASE_URL}/facilities/${facilityId}/availability`,
  BOOK_FACILITY: `${API_BASE_URL}/facilities/book`,
  GET_MY_BOOKINGS: `${API_BASE_URL}/facilities/bookings/my`,
  CANCEL_BOOKING: (bookingId) => `${API_BASE_URL}/facilities/bookings/${bookingId}/cancel`,
  REVIEW_FACILITY: (facilityId) => `${API_BASE_URL}/facilities/${facilityId}/review`,
  CREATE_FACILITY: `${API_BASE_URL}/facilities`,
  GET_MY_FACILITIES: `${API_BASE_URL}/facilities/owner/my`,
  GET_FACILITY_BOOKINGS: (facilityId) => `${API_BASE_URL}/facilities/owner/${facilityId}/bookings`,
  UPDATE_FACILITY: (facilityId) => `${API_BASE_URL}/facilities/${facilityId}`,
  UPDATE_FACILITY_SCHEDULE: (facilityId) => `${API_BASE_URL}/facilities/${facilityId}/schedule`,
  
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
  
  // News
  GET_NEWS: `${API_BASE_URL}/news`,
  GET_NEWS_SCORES: `${API_BASE_URL}/news/scores`,
  
  // Messages
  GET_MESSAGES: `${API_BASE_URL}/messages`,
  GET_CONVERSATIONS: `${API_BASE_URL}/messages/conversations`,
  SEND_MESSAGE: `${API_BASE_URL}/messages/send`,
};

export { API_BASE_URL, CHAT_BASE_URL };
