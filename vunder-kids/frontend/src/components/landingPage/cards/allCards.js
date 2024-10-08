import SetMatch from "./setMatch";
import SportsBuddies from "./sportsBuddies";
import SportsProfile from "./sportsProfile";
import TrackGames from "./trackGames";

function AllCards() {
    return (
        <div className="flex overflow-hidden flex-col bg-gray-100">
            <div className="flex flex-col pr-7 pl-16  w-full max-md:px-5 max-md:max-w-full">
                <SportsProfile />
                <SetMatch />
                <TrackGames />
                <SportsBuddies />
            </div>
        </div>
    )
}

export default AllCards;
