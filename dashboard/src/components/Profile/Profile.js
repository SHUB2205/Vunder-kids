  import {React,useContext,useEffect,useState} from 'react'
  import "./Profile.css"
  // import editIcon from "../images/EditIcon.svg"
  import ProfileStats from './ProfileStats'
  import ProfileMatches from './ProfileMatches'
  import ProfilePosts from './ProfilePosts'
  import IsAuth from '../../createContext/is-Auth/IsAuthContext'
  import ProfilePhotos from './ProfilePhotos'
  import ProfileReels from './ProfileReels'
  import { Link, useParams } from 'react-router-dom'
  import { ProfileContext } from '../../createContext/Profile/ProfileContext'
import { PostContext } from '../../createContext/Post/PostContext'

  const tabs = ['Overview','Photos','Post','Reels','Matches'];


  export default function Profile() {
    const [activeTab, setActiveTab] = useState('Overview');
    const {user} = useContext(IsAuth);
    const {username} = useParams();
    const {getProfile ,profile,toggleFollow,setProfile,userPosts = [], getUserPosts} = useContext(ProfileContext);
    const [isFollowed,setFollowed] = useState(false);
    const {Myposts,getPosts} = useContext(PostContext);
    useEffect(() => {
      if (!profile) {
        getProfile(username);
      }
      
      if (user && profile) {
        // Ensure following is an array and all objects in it have _id
        if (Array.isArray(user.following) && user.following.some(followed => followed?._id === profile._id)) {
          setFollowed(true);
        }
      }
    
      if (username && userPosts.length === 0) {
        getUserPosts(username);
      }
      
      if (!username && Myposts.length === 0) {
        getPosts(true);
      }
    }, [username, getProfile, profile, user, getPosts, getUserPosts]);
    const handleFollow = async() => {
      await toggleFollow(profile._id);
      setFollowed(prevIsFollowed => !prevIsFollowed);
      setProfile(prevProfile => ({...prevProfile,followers: prevProfile.followers + (isFollowed ? -1 : 1)}));
    }

    if (username && !profile) {return <div className='ProfileContainer'>No Profile with given username found .</div>}
  
    return (
      <div className="ProfileContainer">
        <div className="ProfileHeader">
          @
          {username
            ? profile
              ? profile.userName
              : ""
            : user
            ? user.userName
            : ""}
        </div>
        <div className="profile-main">
          <div className="profile-image">
            <img
              src={
                username
                  ? profile
                    ? profile.avatar
                    : ""
                  : user
                  ? user.avatar
                  : ""
              }
              alt="Profile"
              className="profile-avatar"
            />
          </div>

          <div className="profile-info">
            <h1 className="profile-name">
              {username
                ? profile
                  ? profile.userName
                  : ""
                : user
                ? user.userName
                : ""}
            </h1>
            <div className="profile-metrics">
              <div className="metric">
                <span className="metric-value">
                  {username
                    ? userPosts
                      ? userPosts.length
                      : 0
                    : Myposts
                    ? Myposts.length
                    : 0}
                </span>
                <span className="metric-label">posts</span>
              </div>
              <div className="metric">
                {username ?
                <>
                <span className="metric-value">
                    {profile? username? profile.followers: user.followers.length: 0}
                  </span>
                  <span className="metric-label"> followers</span>
                </>  : (<Link
                  to={`/list/followers`}>
                  <span className="metric-value">
                    {profile? profile.followers: 0}
                  </span>
                  <span className="metric-label"> followers</span>
                </Link>)}
              </div>
              <div className="metric">
                {username ?
                <>
                <span className="metric-value link">
                    {profile? profile.following: 0}
                  </span>
                  <span className="metric-label link"> following</span>
                </> :(<Link to={`/list/following`}>
                  <span className="metric-value link">
                    {profile ? username ? profile.following: user.following.length: 0}
                  </span>
                  <span className="metric-label link"> following</span>
                </Link>)}
              </div>
            </div>

            <p className="profile-bio">
              Passionate football enthusiast | Dedicated athlete | Striving for
              excellence on and off the pitch.
            </p>

            <div className="profile-divider">
              <div>
                <div className="profile-location">
                  <span className="location-icon">📍</span>
                  <span>Washington</span>
                </div>

                <div className="profile-followers">
                  <span>Followed by</span>
                  <div className="follower-avatars">
                    <img src={profile ? profile.avatar : ""} alt="follower1" />
                    <img src={profile ? profile.avatar : ""} alt="follower2" />
                    <img src={profile ? profile.avatar : ""} alt="follower3" />
                  </div>
                  <span className="follower-names">Jimin,sarah,alex..</span>
                </div>
              </div>
              {username && user && user.userName !== profile.userName && (
                <button className="followButton" onClick={handleFollow}>
                  {isFollowed ? "Unfollow" : "Follow"}
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="ProfileNav">
          {tabs.map((tab) => (
            <p
              key={tab}
              className={`ProfileTab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </p>
          ))}
        </div>
        <div className="p-4">
          {activeTab === "Overview" && <ProfileStats />}
          {activeTab === "Photos" && <ProfilePhotos />}
          {activeTab === "Post" && <ProfilePosts />}
          {activeTab === "Reels" && <ProfileReels />}
          {activeTab === "Matches" && <ProfileMatches />}
        </div>
      </div>
    );
  }




