import React, { useState } from 'react';
import './CreateGroupModal.css';

const CreateGroupModal = ({ onCreateGroup, onClose }) => {
  const [groupName, setGroupName] = useState('');
  const [members, setMembers] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!groupName.trim()) {
      setError('Group name is required.');
      return;
    }

    const memberIds = members.split(',').map(id => id.trim()).filter(id => id);

    if (memberIds.length === 0) {
      setError('At least one member ID is required.');
      return;
    }

    try {
      await onCreateGroup(groupName, memberIds);
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
          <input
            type="text"
            value={members}
            onChange={(e) => setMembers(e.target.value)}
            placeholder="Member IDs (comma-separated)"
            required
          />
          <div className="button-group">
            <button type="button" onClick={onClose} className="cancel-button">Cancel</button>
            <button type="submit" className="create-button">Create Group</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;