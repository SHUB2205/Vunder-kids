import React from 'react';
import styles from './matchNotification.module.css';
import matchNoti from '../../images/matchNotiAvtar.png'
import matchTeamIcon1 from '../../images/TeamIcon1.png'
import matchTeamIcon2 from '../../images/TeamIcon2.png'
import RejectIcon from '../../images/rejectIcon.png';
import AcceptIcon from '../../images/acceptIcon.png';

const MatchNotificationItem = ({ location, date, time, player1, player2, sport, timestamp, divider }) => {
    return (
        <div>
            <div className={styles.notificationHeader}>
                <img src={matchNoti} alt="Avatar" className={styles.avatar} />
                <div className={styles.notificationDetails}>
                    <div className={styles.notificationTitle}>
                        <span>1 on 1</span> {location},
                        <span className={styles.time}> {date},{time}</span>
                    </div>
                    <div className={styles.content}>
                        <div className={styles.playerDetails}>
                            <div className={styles.player}>
                                <img src={matchTeamIcon1} alt={player1} className={styles.playerAvatar} />
                                <span>{player1}</span>
                            </div>
                            <div className={styles.player}>
                                <img src={matchTeamIcon2} alt={player2} className={styles.playerAvatar} />
                                <span>{player2}</span>
                            </div>
                            <div className={styles.sport}>{sport}</div>
                        </div>
                        <div className={styles.notificationActions}>
                            <div className={styles.buttons}>
                                <button className={styles.rejectButton}>
                                    {/* <span>👎</span> Reject */}
                                    <img src={RejectIcon} alt="Reject" className={styles.icon} /> Reject
                                </button>
                                <button className={styles.acceptButton}>
                                    {/* <span>👍</span> Accept */}
                                    <img src={AcceptIcon} alt="Accept" className={styles.icon} /> Accept
                                </button>
                            </div>
                            <div className={styles.notificationTimestamp}>
                                {timestamp}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.divider}>
                {divider}
            </div>

        </div>
    )
}


export default MatchNotificationItem;


