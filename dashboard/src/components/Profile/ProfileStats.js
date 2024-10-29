import { useState } from "react";
import "./ProfileStats.css";

function ProfileStats() {
    const sports = ["Tennis", "Football", "Badminton"];
    const [activeSport, setActiveSport] = useState("Tennis");

    const fetchedStat = {
        "Matches played": 150,
        "Matches won": 110,
        "Matches lost": 150,
        "Sets played": 110,
        "Sets won": 150,
        "Win/lose ratio": "4:1"
    };

    const EmojiStat = {
        "Matches played": "🥎",
        "Matches won": "🏆",
        "Matches lost": "🙆‍♂️",
        "Sets played": "🤾‍♂️",
        "Sets won": "🏆",
        "Win/lose ratio": "🎯"
    };

    return (
        <div className="statContainer">
            <div className="sportsNav">
                {sports.map((sport) => (
                    <p
                        key={sport}
                        className={`sportTab ${activeSport === sport ? "sportTab_active" : ""}`}
                        onClick={() => setActiveSport(sport)}
                    >
                        {sport}
                    </p>
                ))}
            </div>
            <div className="statMatrix">
                {Object.keys(fetchedStat).map((statKey) => (
                    <div key={statKey} className="statBox">
                        <p className="statLabel">{statKey}</p>
                        <p className="StatInfo">
                            {EmojiStat[statKey]} <span className="StatNum">{fetchedStat[statKey]}</span>
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ProfileStats;
