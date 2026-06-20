import AsyncStorage from '@react-native-async-storage/async-storage';

// Facility owners authenticate with a separate token from regular users.
// All owner API calls must explicitly send this token, since the shared axios
// instance attaches the regular user token by default.
export const getOwnerToken = async () => {
  return AsyncStorage.getItem('ownerToken');
};

// Returns an axios config that authenticates as the facility owner.
// Two owner paths are supported:
//   1. Dedicated owner accounts (login-owner) → a separate `ownerToken`.
//   2. Regular users who became facility_owner → the standard `token`.
// When no ownerToken exists we omit the Authorization override so the shared
// axios interceptor attaches the regular user token instead.
export const getOwnerAuthConfig = async (extra = {}) => {
  const token = await getOwnerToken();
  if (!token) {
    return { ...extra };
  }
  return {
    ...extra,
    headers: {
      ...(extra.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getOwnerData = async () => {
  try {
    const raw = await AsyncStorage.getItem('ownerData');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const clearOwnerSession = async () => {
  await AsyncStorage.removeItem('ownerToken');
  await AsyncStorage.removeItem('ownerData');
};
