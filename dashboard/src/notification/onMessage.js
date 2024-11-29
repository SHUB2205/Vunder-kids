import { messaging } from "./fireBase"; // Import the messaging instance from your Firebase configuration
import { onMessage } from "firebase/messaging"; // Import the onMessage function from Firebase SDK

// Define the onMessage handler
export const setupOnMessage = () => {
  onMessage(messaging, (payload) => {
    console.log(payload); // Log the incoming message payload
    console.log("here"); // Log a message indicating the handler was triggered
  });
};
