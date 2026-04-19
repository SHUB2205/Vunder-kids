// Shared OAuth client IDs for Google & Apple sign-in.
// Used by LoginScreen and RegisterScreen so credentials stay in sync.
export const GOOGLE_IOS_CLIENT_ID =
  '1030504227545-8rln86bm79abnphcgm906ft3cmm84eck.apps.googleusercontent.com';
export const GOOGLE_ANDROID_CLIENT_ID = '';
export const GOOGLE_WEB_CLIENT_ID =
  '1030504227545-7ngrdrgj665me1kgmuepp5cp8f4fg5mp.apps.googleusercontent.com';

export const isGoogleConfigured = () =>
  !!GOOGLE_WEB_CLIENT_ID && GOOGLE_WEB_CLIENT_ID.length > 0;
