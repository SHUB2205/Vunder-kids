import React from 'react';
import styles from './matchNotification.module.css';
import matchNoti from '../../images/matchNotiAvtar.png';
import matchTeamIcon1 from '../../images/TeamIcon1.png';
import matchTeamIcon2 from '../../images/TeamIcon2.png';
import RejectIcon from '../../images/rejectIcon.png';
import AcceptIcon from '../../images/acceptIcon.png';

const MatchNotificationItem = ({ location, date, time, player1, player2, sport, timestamp, divider }) => {
    return (
        <div className={styles.matchNotificationItem}>
            <div className={styles.matchHeader}>
                <img src={matchNoti} alt="Avatar" className={styles.avatar} />

                <div className={styles.matchDetails}>
                    <div className={styles.matchTitle}>
                        <div className={styles.type}>1 on 1</div>
                        <div className={styles.location}>{location},</div>
                        <div className={styles.time}>{date}, {time}</div>
                    </div>

                    <div className={styles.content}>
                        <div className={styles.playerDetails}>
                            <div className={styles.player}>
                                <img src={matchTeamIcon1} alt={player1} className={styles.playerAvatar} />
                                <div>{player1}</div>
                            </div>
                            <div className={styles.player}>
                                <img src={matchTeamIcon2} alt={player2} className={styles.playerAvatar} />
                                <div>{player2}</div>
                            </div>
                        </div>
                        <div className={styles.actions}>
                            <button className={styles.acceptButton}>
                                <img src={AcceptIcon} alt="Accept" className={styles.icon} /> Accept
                            </button>
                            <button className={styles.rejectButton}>
                                <img src={RejectIcon} alt="Reject" className={styles.icon} /> Reject
                            </button>
                        </div>
                        <div className={styles.timestamp}>{timestamp}</div>
                    </div>

                    <div className={styles.sport}>{sport}</div>
                </div>
            </div>

            {/* for responsive style */}
            <div className={styles.responsivehead}>
                <div className={styles.content}>
                    <div className={styles.playerDetails}>
                        <div className={styles.player}>
                            <img src={matchTeamIcon1} alt={player1} className={styles.playerAvatar} />
                            <div>{player1}</div>
                        </div>
                        <div className={styles.player}>
                            <img src={matchTeamIcon2} alt={player2} className={styles.playerAvatar} />
                            <div>{player2}</div>
                        </div>
                    </div>
                    <div className={styles.actions}>
                        <button className={styles.acceptButton}>
                            <img src={AcceptIcon} alt="Accept" className={styles.icon} /> Accept
                        </button>
                        <button className={styles.rejectButton}>
                            <img src={RejectIcon} alt="Reject" className={styles.icon} /> Reject
                        </button>
                    </div>
                    <div className={styles.timestamp}>{timestamp}</div>
                </div>
            </div>

            <div className={styles.responsive}>
                <div className={styles.sport}>{sport} ,</div>
                <div className={styles.time}>{date}, {time}</div>
                <div className={styles.timestamp}>{timestamp}</div>
            </div>
            <div className={styles.divider}>{divider}</div>
        </div>
    );
};


export default MatchNotificationItem;
