import {React,useState} from 'react'
import "./Profile.css"
import editIcon from "../images/EditIcon.svg"
import ProfileStats from './ProfileStats'
import ProfileMatches from './ProfileMatches'
import ProfilePosts from './ProfilePosts'

const tabs = ['Overview', 'Post', 'Matches'];
const UserPhoto = 'https://s3-alpha-sig.figma.com/img/d5c5/5e01/c6c96a4ec39c33d32fc11058a6c5c4e7?Expires=1730678400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=ccpOo8vBisEf5wBVDZLNi2w84jc9uOmFYhQKlIQfVzwML1XCUUYBrLb3BgW7GyHDpKWh4vRoYE2hUuF2R9-PHBaXg6C5G7zQKK1bAniP~XMs7O13hsuGDk3NrZSd648nzc94yXItLGLbN0CvUOxqErEe8U4EwhkZ7SVuR01DRXcDUm3EdPT6OrIbva28euaGHiZRurm3~tp2Ly~bmB83NphdsnNAZqvx3HpWChKsNtyGFl4~91CsQpi5msA6auor~jssAean2PRBHR~S828qPTFNYcepc8lvRSDVz0OH~CGFcnY17bqJgaGwJ2HILRiTUnSj4aZw1cMmhhNRCqIusg__';
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
        {activeTab === 'Overview' &&<ProfileStats/> }
        {activeTab === 'Post' && <ProfilePosts/>}
        {activeTab === 'Matches' && <ProfileMatches/>}
      </div>
    </div>
  );
}




