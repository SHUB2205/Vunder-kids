import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import MatchCard from '../Reusable/MatchStatCard/MatchCard';
import './ProfileMatches.css';
import { ProfileContext } from '../../createContext/Profile/ProfileContext';

function ProfileMatches({username}) {
    const [matches,setMatches] = useState([]);
    const {fetchCompletedMatches} = useContext(ProfileContext);

    useEffect(() => {
        const fecther = async () => {
            const data = await fetchCompletedMatches(username);
            setMatches(data);
        }
        fecther();
    }, []);

    if (matches?.length == 0) return <>You have 0 completed matches.</>

    return (
        <div className='Matchlist'>
            {matches?.map((match, index) => (
                <MatchCard key={index} matchData={match} />
            ))}
        </div>
    );
}

export default ProfileMatches;