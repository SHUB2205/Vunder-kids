import React from 'react';
import styles from './People.module.css';
import searchPeopleIcon1 from '../../images/searchPeople1.png'
import searchPeopleIcon2 from '../../images/searchPeople2.png'
import searchPeopleIcon3 from '../../images/searchPeople3.png'
import searchPeopleIcon4 from '../../images/searchPeople4.png'
import searchPeopleIcon5 from '../../images/searchPeople5.png'



const People = () => {
    const users = [
        {
            name: 'Cristiano Ronaldo',
            username: '@Cristiano',
            followers: '102M',
            bio: 'Welcome to the official Fisiko page of Cristiano Ronaldo.',
            src: searchPeopleIcon1
        },
        {
            name: 'Ronaldo',
            username: '@Ronald212',
            followers: '100k',
            bio: 'Welcome to the official Fisiko page of Ronaldo.',
            src: searchPeopleIcon2
        },
        {
            name: 'Jak Ronaldo',
            username: '@jkron',
            followers: '89k',
            bio: 'Welcome to the official Fisiko page of jkron.',
            src: searchPeopleIcon3
        },
        {
            name: 'mick Ronaldo',
            username: '@mkron',
            followers: '74k',
            bio: 'Welcome to the official Fisiko page of mkron.',
            src: searchPeopleIcon4
        },
        {
            name: 'Ronaldoalex',
            username: '@Calexronal',
            followers: '55k',
            bio: 'Welcome to the official Fisiko page of alexronal.',
            src: searchPeopleIcon5
        },
    ];

    return (
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
    );
};

export default People;

