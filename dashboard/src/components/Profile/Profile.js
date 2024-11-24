import {React,useContext,useState} from 'react'
import "./Profile.css"
// import editIcon from "../images/EditIcon.svg"
import ProfileStats from './ProfileStats'
import ProfileMatches from './ProfileMatches'
import ProfilePosts from './ProfilePosts'
import IsAuth from '../../createContext/is-Auth/IsAuthContext'
import ProfilePhotos from './ProfilePhotos'
import ProfileReels from './ProfileReels'

const tabs = ['Overview','Photos','Post','Reels','Matches'];


export default function Profile() {
  const [activeTab, setActiveTab] = useState('Overview');
  const {user} = useContext(IsAuth);  
  return (
    <div className="ProfileContainer">
      <div className="ProfileHeader">@{user ? user.userName : ''}</div>
      <div className="profile-main">
        <div className="profile-image">
          <img src={user ? user.avatar : ''} alt="Profile" className="profile-avatar" />
        </div>

        <div className="profile-info">
          <h1 className="profile-name">{user ? user.userName : '  '}</h1>
          <div className="profile-metrics">
            <div className="metric">
              <span className="metric-value">15</span>
              <span className="metric-label">posts</span>
            </div>
            <div className="metric">
              <span className="metric-value">{user ? user.followers.length : 0}</span>
              <span className="metric-label">followers</span>
            </div>
            <div className="metric">
              <span className="metric-value">{user ? user.following.length : 0}</span>
              <span className="metric-label">following</span>
            </div>
          </div>

          <p className="profile-bio">
            Passionate football enthusiast | Dedicated athlete | Striving for
            excellence on and off the pitch.
          </p>

          <div className="profile-location">
            <span className="location-icon">📍</span>
            <span>Washington</span>
          </div>

          <div className="profile-followers">
            <span>Followed by</span>
            <div className="follower-avatars">
              <img src={user ? user.avatar : ''} alt="follower1" />
              <img src={user ? user.avatar : ''} alt="follower2" />
              <img src={user ? user.avatar : ''} alt="follower3" />
            </div>
            <span className="follower-names">Jimin,sarah,alex..</span>
          </div>
        </div>
      </div>
      <div className='ProfileNav'>
        {tabs.map(tab => (
          <p
            key={tab}
            className={`ProfileTab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </p>
        ))}
      </div>
      <div className="p-4">
        {activeTab === 'Overview' &&<ProfileStats/> }
        {activeTab === 'Photos' && <ProfilePhotos/>}
        {activeTab === 'Post' && <ProfilePosts/>}
        {activeTab === 'Reels' && <ProfileReels />}
        {activeTab === 'Matches' && <ProfileMatches/>}
      </div>
    </div>
  );
}




