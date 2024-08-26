import React, { useEffect, useState } from "react";
import "./CreateGroupModal.css";

const SERVER_URL = "http://localhost:5000";
const CreateGroupModal = ({ onCreateGroup, onClose }) => {
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [followerDetails, setFollowerDetails] = useState([]);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  useEffect(() => {
    async function getUserId() {
      try {
        const response = await fetch(`${SERVER_URL}/api/getUserId`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.client._id; // Adjust this based on your API response structure
      } catch (error) {
        console.error("Error fetching user ID:", error);
        return null;
      }
    }

    async function fetchUserInfo(userId) {
      try {
        const response = await fetch(`${SERVER_URL}/api/users/${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const user = await response.json();
        // Fetch details for each follower
        await fetchFollowersDetails(user.followers);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    }

    async function fetchFollowersDetails(followers) {
      try {
        if (!followers || followers.length === 0) {
          console.warn('No followers to fetch details for.');
          return;
        }

        const followerPromises = followers.map(async (follower) => {
          try {
            const response = await fetch(`${SERVER_URL}/api/users/${follower}`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                "token": localStorage.getItem("token"),
              },
            });
    
            if (!response.ok) {
              throw new Error(`Error: ${response.status} ${response.statusText}`);
            }
    
            const followerData = await response.json();
            return { _id: followerData._id, name: followerData.name };
          } catch (error) {
            console.error(`Error fetching details for follower ${follower._id}:`, error);
            return { _id: follower, name: 'Unknown' }; // Default value if fetching fails
          }
        });
    
        const details = await Promise.all(followerPromises);
        setFollowerDetails(details);
      } catch (error) {
        console.error("Error fetching follower details:", error);
      }
    }
    

    async function init() {
      const fetchedUserId = await getUserId();
      if (fetchedUserId) {
        setUserId(fetchedUserId);
        fetchUserInfo(fetchedUserId);
      } else {
        console.error("Failed to fetch user ID");
      }
    }

    init();
  }, []);

  const handleCheckboxChange = (followerId) => {
    setSelectedMembers((prevSelected) => {
      if (prevSelected.includes(followerId)) {
        return prevSelected.filter((id) => id !== followerId);
      } else {
        return [...prevSelected, followerId];
      }
    });
  };

  const handleSubmit = async(e) => {
    e.preventDefault();

    // Handle form submission, sending selectedMembers and groupName to your backend
    if (selectedMembers.length === 0) {
      setError('At least one member ID is required.');
      return;
    }

    try {
      await onCreateGroup(groupName, selectedMembers);
      onClose();
    } catch (err) {
      setError('Failed to create group. Please try again.');
    }
  };
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Create New Group</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Group Name"
            required
          />

          <div>
            {/* Example rendering of followers */}
            <div className="checkbox-group">
              {followerDetails.map((follower) => (
                <div key={follower._id}>
                  <label>
                    <input
                      type="checkbox"
                      value={follower._id}
                      onChange={() => handleCheckboxChange(follower._id)}
                    />
                    {follower.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="button-group">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="create-button">
              Create Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default CreateGroupModal;
