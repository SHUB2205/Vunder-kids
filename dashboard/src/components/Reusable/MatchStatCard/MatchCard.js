import React from 'react';
import "./MatchCard.css";

function MatchCard({ matchData }) {
    const renderPlayers = () => {
        // If it's a team match
        if (matchData.isTeamMatch) {
            return matchData.teams.map((teamData, index) => ({
                name: teamData.team.name,
                avatar: "https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg", // Default flag, replace with actual logic
                scores: matchData.scores || [],
                isWinner: matchData.winner?.type === 'Team' && matchData.winner?.ref?._id === teamData.team._id
            }));
        } 
        // If it's an individual match
        else {
            return matchData.players.map(player => ({
                name: player.userName,
                avatar:player.avatar,
                flag: "https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg", // Default flag, replace with actual logic
                scores: matchData.scores || [],
                isWinner: matchData.winner?.type === 'User' && matchData.winner?.ref?._id === player._id
            }));
        }
    };

    const players = renderPlayers();

    return (
        <div className="matchCardContainer">
            <p className="matchInfo">
                {matchData.isTeamMatch ? 'Team Match' : '1 on 1'} at {matchData.location}
            </p>
            <div className="playerStats">
                {players.map((player, index) => (
                    <div key={index} className="player">
                        <div className="playerDetails">
                            <img src={player.avatar} alt={`${player.name} flag`} className="playerIcon" />
                            <span className="playerName">{player.name} {player.isWinner ? "👑":""}</span>
                        </div>
                        <div className="playerScores">
                            {
                                <span
                                    className={`playerScore ${player.isWinner ? "scoreWin" : "scoreLoss"}`}
                                >
                                    {player.scores[index]}
                                </span>
                            }
                        </div>
                    </div>
                ))}
            </div>
            <p className="matchTime">
                {matchData.sport?.name}, {new Date(matchData.date).toLocaleDateString()}, {new Date(matchData.date).toLocaleTimeString()}
            </p>
        </div>
    );
}

export default MatchCard;