import MatchCard from '../Reusable/MatchStatCard/MatchCard'
import './ProfileMatches.css'

function ProfileMatches() {
    return (
    <div className='Matchlist'>
        <MatchCard/>
        <MatchCard/>
        <MatchCard/>
    </div>
    );
}

export default ProfileMatches;