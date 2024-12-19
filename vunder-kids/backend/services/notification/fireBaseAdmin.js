require('dotenv').config(); // Load environment variables from .env file
const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { credential } = require('firebase-admin');

// Initialize the Firebase Admin SDK
// console.log(process.env.GOOGLE_APPLICATION_CREDENTIALS);
const adminApp = initializeApp({
  credential: credential.cert(process.env.GOOGLE_APPLICATION_CREDENTIALS), // Use the path from .env
  projectId: 'vunder-kids-bb948', // Replace with your project ID
});

// Export the initialized app and messaging functions
module.exports = { adminApp };
