import React from 'react';
import './UserList.css';

const UserList = ({ users, onSelectUser }) => (
  <div className="user-list">
    <h3>Users</h3>
    <ul>
      {users.map(user => (
        <li key={user.id} onClick={() => onSelectUser(user)}>
          {user.name}
        </li>
      ))}
    </ul>
  </div>
);

export default UserList;