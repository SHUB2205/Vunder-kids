import React, { useContext, useState } from "react";
import styles from "./Header.module.css";
import addPhoto from "../images/addPhoto.png";
import addScore from "../images/addScore.png";
import ChallengeModal from "./Modals/ChallengeModal/ChallengeModal";
import IsAuth from "../../createContext/is-Auth/IsAuthContext";
import { PostContext } from "../../createContext/Post/PostContext";


function Header() {
  const [postContent, setPostContent] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [previewURL, setPreviewURL] = useState("");
  const { createPost } = useContext(PostContext);
  const {user} = useContext(IsAuth);

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      // Create preview URL for images
      const preview = URL.createObjectURL(file);
      setPreviewURL(preview);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    
    if (!postContent.trim() && !mediaFile) {
      return; // Don't submit empty posts
    }

    const formData = new FormData();
    formData.append('content', postContent);
    if (mediaFile) {
      formData.append('media', mediaFile);
    }

    try {
      await createPost(formData);
      // Reset form
      setPostContent("");
      setMediaFile(null);
      setPreviewURL("");
    } catch (error) {
      console.error('Error creating post:', error);
      // Handle error (show notification, etc.)
    }
  };

  // date
  const [showDateTimeModal, setShowDateTimeModal] = useState(false);
  const handleShowDateTimeModal = () => {
    setShowDateTimeModal(!showDateTimeModal);
  };
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setShowDateTimeModal(false);
  };

  return (
    <>
      <header className={styles.header}>
        <form onSubmit={handlePostSubmit} className={styles.postForm}>
          <img
            src={user ? user.avatar : ''}
            alt="User avatar"
            className={styles.userAvatar}
          />
          <div className={styles.inputWrapper}>
            <textarea
              className={styles.postInput}
              placeholder="Game face on! What's on your mind?"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              aria-label="Create a new post"
            />

            {previewURL && (
              <div className={styles.mediaPreview}>
                <img 
                  src={previewURL} 
                  alt="Upload preview" 
                  className={styles.previewImage}
                />
                <button 
                  type="button" 
                  className={styles.removeMedia}
                  onClick={() => {
                    setMediaFile(null);
                    setPreviewURL("");
                  }}
                >
                  ×
                </button>
              </div>
            )}

            <div className={styles.postActions}>
              <label className={styles.actionButton}>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleMediaChange}
                  style={{ display: 'none' }}
                />
                <img src={addPhoto} alt="" className={styles.actionIcon} />
                <span>Photo/Video</span>
              </label>

              <button
                type="button"
                className={styles.actionButton}
                onClick={handleOpenModal}
              >
                <span
                  className={styles.actionIcon}
                  role="img"
                  aria-label="Basketball"
                  style={{fontSize:'16px'}}
                >
                  🏀
                </span>
                <span>Set Match</span>
              </button>
              <ChallengeModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                handleShowDateModal={handleShowDateTimeModal}
                showDateTimeModal={showDateTimeModal}
              />
              <button type="button" className={styles.actionButton}>
                <img src={addScore} alt="" className={styles.actionIcon} />
                <span>Add Score</span>
              </button>
            </div>
            <button type="submit" className={styles.postButton} disabled={!postContent.trim() && !mediaFile}>
              Post
            </button>
          </div>
        </form>
      </header>
    </>
  );
}

export default Header;