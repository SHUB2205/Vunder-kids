// App.js or your parent component
import React from 'react';
import MatchNotificationItem from './matchNotificationItem';
import styles from './matchNotification.module.css';


const notifications = [
    {
        location: 'Jacksonville, TIAA Bank Field',
        date: 'Mon, Sep 7',
        time: '9:30 AM',
        player1: 'Rayan',
        player2: 'You?',
        sport: 'Football',
        timestamp: '1h',
    },
    {
        location: 'Miami, Hard Rock Stadium',
        date: 'Tue, Sep 8',
        time: '11:00 AM',
        player1: 'John',
        player2: 'Mike',
        sport: 'Soccer',
        timestamp: '2h',
    },
    {
        location: 'Orlando, Camping World Stadium',
        date: 'Wed, Sep 9',
        time: '10:00 AM',
        player1: 'Alex',
        player2: 'Chris',
        sport: 'Basketball',
        timestamp: '3h',
    }
];

const MatchNotification = () => {
    return (
        <div >
            {notifications.map((notification, index) => (
                <MatchNotificationItem
                    key={index}
                    location={notification.location}
                    date={notification.date}
                    time={notification.time}
                    player1={notification.player1}
                    player2={notification.player2}
                    sport={notification.sport}
                    timestamp={notification.timestamp}
                    divider={notification.divider}
                />
            ))}
        </div>
    );
};

export default MatchNotification;
