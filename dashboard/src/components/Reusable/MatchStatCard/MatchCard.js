import "./MatchCard.css";

function MatchCard() {
    const matchData = {
        matchInfo: "1 on 1 Jacksonville, TIAA Bank Field",
        matchTime: "Tennis, Mon, Sep 7, 9:30 AM",
        players: [
            {
                name: "Yamaguchi",
                flag: "https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg",
                scores: [0, 20, 15],
                isWinner: false
            },
            {
                name: "Nagasaju",
                flag: "https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg",
                scores: [2, 22, 15],
                isWinner: true
            }
        ]
    };

    return (
        <div className="matchCardContainer">
            <p className="matchInfo">{matchData.matchInfo}</p>
            <div className="playerStats">
                {matchData.players.map((player, index) => (
                    <div key={index} className="player">
                        <div className="playerDetails">
                            <img src={player.flag} alt={`${player.name} flag`} className="playerIcon" />
                            <span className="playerName">{player.name}</span>
                        </div>
                        <div className="playerScores">
                            {player.scores.map((score, i) => (
                                <span
                                    key={i}
                                    className={`playerScore ${i === 0 ? (player.isWinner ? "scoreWin" : "scoreLoss") : ""}`}
                                >
                                    {score}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <p className="matchTime">{matchData.matchTime}</p>
        </div>
    );
}

export default MatchCard;
