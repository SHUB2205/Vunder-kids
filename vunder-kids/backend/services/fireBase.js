
const { initializeApp, applicationDefault } = require('firebase-admin/app');
process.env.GOOGLE_APPLICATION_CREDENTIALS;
// Initialize the Firebase Admin SDK with the environment variable
const adminApp = initializeApp({
  credential: applicationDefault(),
  projectId: 'vunder-kids-bb948', // Replace with your project ID
});

// Export the initialized app and messaging functions

module.exports = { adminApp };
