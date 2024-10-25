import {React,useState} from 'react'
import "./Profile.css"
import UserPhoto from '../images/UserPhoto3.png'
import editIcon from "../images/EditIcon.svg"


const tabs = ['Overview', 'Post', 'Matches'];

const user = {
  username: "James"
}

export default function Profile() {
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <div className="ProfileContainer">
      <div className="ProfileHeader">@{user.username}</div>
      <div className="profile-main">
        <div className="profile-image">
          <img src={UserPhoto} alt="Profile" className="profile-avatar" />
        </div>

        <div className="profile-info">
          <h1 className="profile-name">{user.username}</h1>
          <div className="profile-metrics">
            <div className="metric">
              <span className="metric-value">15</span>
              <span className="metric-label">posts</span>
            </div>
            <div className="metric">
              <span className="metric-value">200</span>
              <span className="metric-label">followers</span>
            </div>
            <div className="metric">
              <span className="metric-value">19</span>
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
              <img src={UserPhoto} alt="follower1" />
              <img src={UserPhoto} alt="follower2" />
              <img src={UserPhoto} alt="follower3" />
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
        {activeTab === 'Overview' && <div>Overview Content</div>}
        {activeTab === 'Post' && <div>Post Content</div>}
        {activeTab === 'Matches' && <div>Matches Content</div>}
      </div>
    </div>
  );
}




