import React from 'react';
import styles from './People.module.css';

const People = ({ users = []}) => {
    return (
        <div className={styles.followList}>
            {users.map((user, index) => (
                <div className={styles.userCard} key={index}>
                    <img src={user.avatar} alt={`profile`} className={styles.profileImage} />
                    <div className={styles.userInfo}>
                        <h3>{user.name} <span>{user.followers} Followers</span></h3>
                        <p>{user.userName}</p>
                        <p>{user.bio}</p>
                    </div>
                    <button className={styles.followBtn}>Follow</button>
                </div>
            ))}
        </div>
    );
};

export default People;

