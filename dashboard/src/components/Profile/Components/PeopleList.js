import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import People from '../../Search/People/People';
import IsAuth from '../../../createContext/is-Auth/IsAuthContext';
import '../Profile.css';

const FollowersList = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(IsAuth);
  const [userList, setUserList] = useState([]);

  useEffect(() => {
    if (user){
        if (type === "followers" ){
            setUserList(user.followers);
        }
        else if (type === "following"){
            setUserList(user.following);
        }
    }
  }, [type, user]);

  const handleGoBack = () => {
    navigate(-1); // This goes back to the previous page
  };

  

  return (
    <div className='ProfileContainer'>
      <div className='ProfileHeader' style={{
        marginBottom:'10px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px'
      }}>
        <ArrowLeft 
          onClick={handleGoBack} 
          style={{ 
            cursor: 'pointer', 
            marginRight: '10px' 
          }} 
        />
        {type === 'followers' ? 'My Followers' : 'My Following'}
      </div>
      <People users={userList} />
    </div>
  );
};

export default FollowersList;