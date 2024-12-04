import React, { useContext, useState, useEffect } from 'react';
import { MatchContext } from './MatchContext';
import axios from 'axios';
import IsAuth from '../is-Auth/IsAuthContext';
const Backend_URL = 'http://localhost:5000';

const MatchState = ({ children }) => {
    const [sports, setSports] = useState([]);
    const [players , setPlayers] = useState([]);
    const [matches, setMatches] = useState([]);
    const [fullMatchData, setFullMatchData] = useState({
        myMatches: [],
        friendsMatches: []
      });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const {token,user} = useContext(IsAuth);

    const fetchSports = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${Backend_URL}/api/sport/`);
            setSports(response.data);
        } 
        catch (err) {
            setSports([]);
          console.log(err);
        }
        finally{
            setLoading(false);
        }
      };
    
      const fetchPlayers = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${Backend_URL}/api/getusers/`);
            setPlayers(response.data);
        } catch (err) {
            setPlayers([]);
          console.log(err);
        }
        finally{
            setLoading(false);
        }
      };
      
      //teamData = {team1 : {name , participant} , team2 : {name, participant}}
      const createMatch = async(type,teamData,matchData) => {
        try {
            setLoading(true);
            //team creation
            let req_data;
            if (type === "team"){
                const team1 = await axios.post(`${Backend_URL}/api/teams/create`,teamData.team1,{headers:{token}});
                const team2 = await axios.post(`${Backend_URL}/api/teams/create`,teamData.team2,{headers:{token}});
                req_data = {matchdata:matchData ,team1:team1.data._id,team2:team2.data._id};
            }
            else{
                req_data = {matchdata:matchData ,players : [user._id,teamData]};
            }
            console.log(req_data);
            const match = await axios.post(`${Backend_URL}/api/matches/create`,req_data,{headers:{token}});
            console.log(match.data);
        }
        catch (err) {
            setSports([]);
            console.log(err);
        }
        finally{
            setLoading(false);
        }
      };

    const fetchMatches = async () => {
    try {
        const response = await axios.get('http://localhost:5000/api/matches/upcoming-matches', {
        headers: { token }
        });
        
        setFullMatchData({
        myMatches: response.data.myMatches,
        friendsMatches: response.data.friendsMatches
        });
    } catch (err) {
        console.error('Error fetching matches:', err);
        setFullMatchData({ myMatches: [], friendsMatches: [] });
    }
    };

    const fetchScheduledMatches = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/matches/sch-matches');
            setMatches(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch scheduled matches');
            setLoading(false);
        }
    };

    useEffect(() => {
        if (sports.length ==0)
            fetchSports();
        if (players.length == 0)
            fetchPlayers();

        fetchMatches();
        fetchScheduledMatches();
    }, [token]);

    const updateAggrement=async(action,matchId)=>{
        try {
            console.log(action);
            const response = await axios.post(
              `${Backend_URL}/api/matches/agreement`,
              {
                matchId, // Pass the match ID dynamically
                userResponse: action,  // "accept" or "reject"
              },
              {
                headers: {
                  token, // Add token for authentication
                },
              }
            );
        
            if (response.status === 200) {
              // Handle success
              console.log("Action successful:", response.data);
              // Optionally update the UI or show a notification
              alert(`Match ${action}ed successfully.`);
            }
          } catch (error) {
            // Handle error
            console.error(`Error performing ${action} action:`, error);
            alert("An error occurred. Please try again.");
          }
    }

    return (
        <MatchContext.Provider value={{
            sports,
            players,
            loading,
            createMatch,
            error,
            fullMatchData,
            matches,
            updateAggrement
        }}>
            {children}
        </MatchContext.Provider>
    );
};

export default MatchState;