import React, { useContext, useEffect, useState } from 'react';
import styles from './People.module.css';
import IsAuth from '../../../createContext/is-Auth/IsAuthContext';
import { ProfileContext } from '../../../createContext/Profile/ProfileContext';

const People = ({ users = [] }) => {
  const { user } = useContext(IsAuth);
  const [people, setPeople] = useState(users);
  const { toggleFollow } = useContext(ProfileContext);

  useEffect(() => {
    setPeople(
      users.map((userItem) => ({
        ...userItem,
        isFollowed: user.following
          ?.filter(followed => followed !== null && followed !== undefined) // Filter out null or undefined
          .some(followed => followed._id === userItem._id),
      }))
    );
  }, [users, user]);

  const handleFollow = async (userId) => {
    await toggleFollow(userId);

    setPeople((prevPeople) =>
      prevPeople.map((userItem) =>
        userItem._id === userId
          ? { 
              ...userItem, 
              isFollowed: !userItem.isFollowed, 
              followers: userItem.followers + (userItem.isFollowed ? -1 : 1) 
            }
          : userItem
      )
    );
  };

  return (
    <div className={styles.followList}>
      {people.map((_user, index) => (
        <div className={styles.userCard} key={index}>
          <img src={_user.avatar} alt={`profile`} className={styles.profileImage} />
          <div className={styles.userInfo}>
            <h3>{_user.name} <span>{_user.followers} Followers</span></h3>
            <p>{_user.userName}</p>
            <p>{_user.bio}</p>
          </div>
          <button className={styles.followBtn} onClick={() => handleFollow(_user._id)}>
            { _user.isFollowed ? "Unfollow" : "Follow" }
          </button>
        </div>
      ))}
    </div>
  );
};

export default People;
