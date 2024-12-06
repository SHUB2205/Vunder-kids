import { useState } from "react";
import "./ProfileStats.css";

function ProfileStats({ progress }) {
    // Get sport names from sportScores
    const sports = progress?.sportScores 
        ? progress.sportScores.map(sportScore => sportScore.sport.name)
        : [];

    const [activeSport, setActiveSport] = useState(sports[0] || "All");

    // Function to get sport-specific or overall stats
    const getStats = () => {
        if (!progress)  return {
            "Matches played": 0 ,
            "Matches won": 0,
            "Matches lost": 0,
            "Score": 0,
            "Avg. Score per Match": 0.00,
            "Win/lose ratio": 0.00
        };

        // Overall stats if "All" is selected
        if (activeSport === "All") {
            return {
                "Matches played": progress.totalMatches ,
                "Matches won": progress.matchesWon,
                "Matches lost": progress.totalMatches - progress.matchesWon,
                "Score": progress.overallScore,
                "Avg. Score per Match": (progress.overallScore / (progress.totalMatches || 1)).toFixed(2),
                "Win/lose ratio": (progress.matchesWon / (progress.totalMatches || 1)).toFixed(2)
            };
        }

        // Sport-specific stats
        const sportStats = progress.sportScores.find(ss => ss.sport.name === activeSport);
        if (!sportStats) return {};

        return {
            "Matches played": sportStats.totalMatches,
            "Matches won": sportStats.wonMatches,
            "Matches lost": sportStats.totalMatches - sportStats.wonMatches,
            "Score": sportStats.score,
            "Avg. Score per Match": (sportStats.score / (sportStats.totalMatches || 1)).toFixed(2),
            "Win/lose ratio": (sportStats.wonMatches / (sportStats.totalMatches || 1)).toFixed(2)
        };
    };

    const fetchedStat = getStats();

    const EmojiStat = {
        "Matches played": "🥎",
        "Matches won": "🏆",
        "Matches lost": "🙆‍♂️",
        "Score": "📊",
        "Avg. Score per Match": "🤾‍♂️",
        "Win/lose ratio": "🎯"
    };

    // Include "All" in sports tabs
    const allSports = ["All", ...sports];

    return (
        <div className="statContainer">
            <div className="sportsNav">
                {allSports.map((sport) => (
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
