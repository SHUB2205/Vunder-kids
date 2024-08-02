import React from 'react';
import './GroupList.css';

const GroupList = ({ groups, onSelectGroup }) => (
  <div className="group-list">
    <h3>Groups</h3>
    <ul>
      {groups.map(group => (
        <li key={group.id} onClick={() => onSelectGroup(group)}>
          {group.name}
        </li>
      ))}
    </ul>
  </div>
);

export default GroupList;