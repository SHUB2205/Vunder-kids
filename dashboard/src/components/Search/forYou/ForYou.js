import React from 'react';
import styles from './ForYou.module.css';
import Post from './Post';
import searchPeopleIcon1 from '../../images/searchPeople1.png'
import ronaldoPic from '../../images/ronaldo.png'


const users = [
    {
        name: 'Cristiano Ronaldo',
        username: '@Cristiano',
        followers: '102M',
        bio: 'Welcome to the official Fisiko page of Cristiano Ronaldo.',
        src: searchPeopleIcon1
    }
]
const posts = [
    {
        id: 1,
        author: 'James',
        avatar: searchPeopleIcon1,
        time: '12 hours ago',
        content: 'Where champions are made and legends are born',
        image: ronaldoPic,
        likes: 223
    },
];

function ForYou() {
    return (
        <div className={styles.header}>
            <div className={styles.wrapper}>
                <div className={styles.followList}>
                    {users.map((user, index) => (
                        <div className={styles.userCard} key={index}>
                            <img src={user.src} alt={`profile`} className={styles.profileImage} />
                            <div className={styles.userInfo}>
                                <h3>{user.name} <span>{user.followers} Followers</span></h3>
                                <p>{user.username}</p>
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