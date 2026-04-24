/**
 * Expo Push Notification dispatcher.
 *
 * Uses the Expo Push API directly (no extra dependency) because `expo-server-sdk`
 * is not installed in this project.
 *
 *   POST https://exp.host/--/api/v2/push/send
 *
 * Docs: https://docs.expo.dev/push-notifications/sending-notifications/
 */

const axios = require('axios');
const mongoose = require('mongoose');

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

// Quick sanity check: Expo tokens look like "ExponentPushToken[xxxxxxxx]" or "ExpoPushToken[xxxxxxxx]"
const isValidExpoToken = (token) =>
  typeof token === 'string' &&
  (token.startsWith('ExponentPushToken[') || token.startsWith('ExpoPushToken['));

/**
 * Send a push notification to one or more Expo tokens.
 *
 * @param {string|string[]} tokens  One or many Expo push tokens.
 * @param {object} payload          { title, body, data }
 * @returns {Promise<void>}
 */
const sendExpoPush = async (tokens, payload) => {
  const list = (Array.isArray(tokens) ? tokens : [tokens]).filter(isValidExpoToken);
  if (list.length === 0) return;

  const messages = list.map((to) => ({
    to,
    sound: 'default',
    title: payload.title,
    body: payload.body,
    data: payload.data || {},
    priority: 'high',
    channelId: 'default',
  }));

  try {
    // Expo accepts up to 100 messages per request. Batch just in case.
    const chunk = 100;
    for (let i = 0; i < messages.length; i += chunk) {
      await axios.post(EXPO_PUSH_URL, messages.slice(i, i + chunk), {
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        timeout: 10_000,
      });
    }
  } catch (err) {
    console.error('[push] Expo send failed:', err.response?.data || err.message);
  }
};

/**
 * Look up a user by id and send them a push notification.
 *
 * Silent on any failure — a broken token should never break the calling route.
 */
const sendPushToUser = async (userId, { title, body, data } = {}) => {
  if (!userId || !title || !body) return;
  try {
    const User = mongoose.model('User');
    const user = await User.findById(userId).select('notificationToken');
    if (!user?.notificationToken) return;
    await sendExpoPush(user.notificationToken, { title, body, data });
  } catch (err) {
    console.error('[push] sendPushToUser error:', err.message);
  }
};

/**
 * Send to many users at once.
 */
const sendPushToUsers = async (userIds, payload) => {
  if (!Array.isArray(userIds) || userIds.length === 0) return;
  try {
    const User = mongoose.model('User');
    const users = await User.find({ _id: { $in: userIds } }).select('notificationToken');
    const tokens = users.map((u) => u.notificationToken).filter(Boolean);
    if (tokens.length) await sendExpoPush(tokens, payload);
  } catch (err) {
    console.error('[push] sendPushToUsers error:', err.message);
  }
};

module.exports = { sendExpoPush, sendPushToUser, sendPushToUsers, isValidExpoToken };
