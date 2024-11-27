import React from 'react';
import styles from './ForYou.module.css';
import Post from '../../Home/Post';
import People from '../People/People';


function ForYou({users = [] , posts = []}) {
    return (
        <div className={styles.header}>
            <div className={styles.wrapper}>
                <div className={styles.followList}>
                    <People users={users} />
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