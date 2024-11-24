import React from 'react';
import styles from './ForYou.module.css';
import Post from '../../Home/Post';


function ForYou({users = [] , posts = []}) {
    return (
        <div className={styles.header}>
            <div className={styles.wrapper}>
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
                <main className={`${styles.mainContent}`}>
                    {posts.map(post => (
                        <Post key={post.id} {...post} />
                    ))}
                </main>
            </div>
        </div>
    );
}

export default ForYou;