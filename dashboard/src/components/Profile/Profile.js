  import {React,useContext,useEffect,useRef,useState} from 'react'
  import "./Profile.css"
  import { PenLine } from 'lucide-react';
  import ProfileStats from './ProfileStats'
  import ProfileMatches from './ProfileMatches'
  import ProfilePosts from './ProfilePosts'
  import IsAuth from '../../createContext/is-Auth/IsAuthContext'
  import ProfilePhotos from './ProfilePhotos'
  import ProfileReels from './ProfileReels'
  import { Link, useParams } from 'react-router-dom'
  import { ProfileContext } from '../../createContext/Profile/ProfileContext'
  import { PostContext } from '../../createContext/Post/PostContext'
  import TextareaAutosize from 'react-textarea-autosize';


  const tabs = ['Overview','Photos','Post','Reels','Matches'];
  const skillLevelProgress = {"Beginner": 1,"Foundation": 2,"Intermediate": 3,"Advance": 4,"Pro": 5};

  export default function Profile() {
    const [showPassions, setShowPassions] = useState(false);
    const [activeTab, setActiveTab] = useState('Overview');
    const {user} = useContext(IsAuth);
    const {username} = useParams();
    const [isEditing, setIsEditing] = useState(false);
    const {getProfile ,profile,toggleFollow,setProfile,userPosts = [], getUserPosts,updateUser} = useContext(ProfileContext);
    const [isFollowed,setFollowed] = useState(false);
    const {Myposts,getPosts} = useContext(PostContext);
    const [editedProfile, setEditedProfile] = useState({});
    const [editingField, setEditingField] = useState(null);
    const fileInputRef = useRef(null);


    const handleAvatarUpload = async (event) => {
      const file = event.target.files[0];
      if (file) {
          try {
              setEditedProfile(prev => ({...prev,media : file,avatar: URL.createObjectURL(file)}));
          } catch (error) {
              console.error('Avatar upload failed', error);
          }
      }
    };
    
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setEditedProfile((prev) => ({ ...prev, [name]: value }));
    };

    useEffect(() => {
      const fetcher = async() => {
        if (username && userPosts.length ===  0) {
         await getUserPosts(username);
        }
        if(!username && Myposts.length === 0) {
          await getPosts(true);
        }
        if (!profile) {
          await getProfile(username);
        }
      }
      
      if (user && profile) {
        // Ensure following is an array and all objects in it have _id
        if (Array.isArray(user.following) && user.following.some(followed => followed?._id === profile._id)) {
          setFollowed(true);
        }
      }

      fetcher();
    }, [username, profile,user]);

    const handleFollow = async() => {
      await toggleFollow(profile._id);
      setFollowed(prevIsFollowed => !prevIsFollowed);
      setProfile(prevProfile => ({...prevProfile,followers: prevProfile.followers + (isFollowed ? -1 : 1)}));
    }

    const handleSaveProfile = async () => {
      try {
        const formData = new FormData();
        Object.entries(editedProfile).forEach(([key, value]) => {
          formData.append(key, value);
        });
        await updateUser(formData);
        setIsEditing(false);
        window.location.reload();
      } catch (error) {
          console.error('Profile update failed', error);
      }
    };


    if (username && !profile) {return <div className='ProfileContainer'>No Profile with given username found .</div>}
    const currentUser = username ? profile : user;

    return (
      <div className="ProfileContainer">
        {isEditing ? <div className="ProfileHeader">@<input name="userName" value={editedProfile.userName || currentUser?.userName } onChange={handleInputChange}/></div>:<div className="ProfileHeader" onClick={()=> {if(isEditing){setEditingField('userName')}}}>@{currentUser?.userName}</div>}
        <div className="profileBox">
          <div className="profile-main">
            {isEditing ? 
            ( <div className="profile-image">
              <div className="profile-avatar-edit-container">
                  <img
                      src={editedProfile.avatar || currentUser?.avatar}
                      alt="Profile"
                      className="profile-avatar"
                  />
                  <div 
                      className="avatar-overlay"
                      onClick={() => fileInputRef.current.click()}
                  >
                      Upload
                  </div>
                  <input 
                      type="file" 
                      ref={fileInputRef}
                      style={{display: 'none'}}
                      accept="image/*"
                      onChange={handleAvatarUpload}
                  />
              </div>
              </div>):
            <div className="profile-image">
              <img src={currentUser?.avatar} alt="Profile" className="profile-avatar"/>
            </div>}

            <div className="profile-info">
            {isEditing ? <div className="profile-name"><input name="name" value={editedProfile.name || currentUser?.name } onChange={handleInputChange}/></div>:<h1 className="profile-name" onClick={()=> {if(isEditing){setEditingField('name')}}}>{currentUser?.name}</h1>}
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
                  {username ? (
                    <>
                      <span className="metric-value">
                        {profile
                          ? username
                            ? profile.followers
                            : user.followers.length
                          : 0}
                      </span>
                      <span className="metric-label"> followers</span>
                    </>
                  ) : (
                    <Link to={`/list/followers`}>
                      <span className="metric-value">
                        {profile ? profile.followers : 0}
                      </span>
                      <span className="metric-label"> followers</span>
                    </Link>
                  )}
                </div>
                <div className="metric">
                  {username ? (
                    <>
                      <span className="metric-value link">
                        {profile ? profile.following : 0}
                      </span>
                      <span className="metric-label link"> following</span>
                    </>
                  ) : (
                    <Link to={`/list/following`}>
                      <span className="metric-value link">
                        {profile
                          ? username
                            ? profile.following
                            : user.following.length
                          : 0}
                      </span>
                      <span className="metric-label link"> following</span>
                    </Link>
                  )}
                </div>
              </div>

              {isEditing ? <TextareaAutosize name="bio" className='profile-bio'  value={editedProfile.bio || currentUser?.bio} minRows={2} maxRows={15} maxLength={600} onChange={handleInputChange}/> : 
              <p className="profile-bio text-wrap">
                {currentUser?.bio}
              </p>}

              <div className="profile-divider">
                <div>
                  <div className="profile-location">
                    <span className="location-icon">📍</span>
                    {isEditing ? <input name="location" value={editedProfile.location || currentUser?.location } onChange={handleInputChange}/>: <span onClick={()=> {if(isEditing){setEditingField('location')}}}>{currentUser?.location}</span>}
                  </div>

                  {username && profile?.followedBy?.length > 0 && (
                    <div className="profile-followers">
                      <span>Followed by</span>
                      <div className="follower-avatars">
                        {profile.followedBy.map((_f) => (
                          <img src={_f.avatar} alt="followedBy" />
                        ))}
                      </div>
                      <span className="follower-names">
                        {profile.followedBy.map((follower, index) => (
                          <span key={follower.id}>
                            {follower.name.split(" ")[0].toLowerCase()}
                            {index < profile.followedBy.length - 1 ? "," : " ..."}
                          </span>
                        ))}
                      </span>
                    </div>
                  )}
                </div>
                {username && user && user.userName !== profile.userName && (
                  <button className="followButton" onClick={handleFollow}>
                    {isFollowed ? "Unfollow" : "Follow"}
                  </button>
                )}
                {!username&& !isEditing && (
                      <button 
                          className="followButton edit-profile-button"
                          onClick={() => setIsEditing(true)}
                      >
                          Edit Profile
                      </button>
                )}
                {isEditing && <div className="edit-profile-button">
                        <button 
                            className="followButton" 
                            onClick={handleSaveProfile}
                        >
                            Save
                        </button>
                        <button 
                            className="followButton-cancel" 
                            onClick={() => {setEditingField("");setIsEditing(false);setEditedProfile({})}}
                        >
                            Cancel
                        </button>
                    </div>
                  }
              </div>
            </div>
          </div>
          <div className="profile-passions">
            <span
              className="show-passions-toggle"
              onClick={() => setShowPassions(!showPassions)}
            >
              {showPassions ? "▼" : ">"} Show Passions
            </span>

            <div className="passion-container">
              {showPassions && (
                <div className="passions-list">
                  {(username ? profile.passions : user.passions).map(
                    (passion) => (
                      <div key={passion._id} className="passion-item">
                        <div className="passion-name">{passion.name}</div>
                        <div className="passion-skill-bar">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`skill-bar-segment ${
                                level <= skillLevelProgress[passion.skillLevel]
                                  ? "filled"
                                  : ""
                              }`}
                            ></div>
                          ))}
                          <span className="skill-level">
                            {passion.skillLevel}
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
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
          {activeTab === "Overview" && <ProfileStats progress={currentUser?.progress}/>}
          {activeTab === "Photos" && <ProfilePhotos />}
          {activeTab === "Post" && <ProfilePosts />}
          {activeTab === "Reels" && <ProfileReels />}
          {activeTab === "Matches" && <ProfileMatches />}
        </div>
      </div>
    );
  }