import React, { useState, useContext } from 'react';
import { ReelContext } from '../../../createContext/Reels/ReelContext';
import './CreateReelBox.css';

function CreateReelBox() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [videoFile, setVideoFile] = useState(null);
    const [description, setDescription] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const { createReel, getReels } = useContext(ReelContext);

    const handleVideoChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('video/')) {
            setVideoFile(file);
        } else {
            alert('Please select a valid video file');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!videoFile) {
            alert('Please select a video');
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('media', videoFile);
            formData.append('description', description);

            await createReel(formData);
            await getReels(true);
            setIsModalOpen(false);
            setVideoFile(null);
            setDescription('');
        } catch (error) {
            console.error('Error uploading reel:', error);
            alert('Failed to upload reel');
        } finally {
            setIsUploading(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setVideoFile(null);
        setDescription('');
    };

    return (
        <>
            <div className="create-reel-box" onClick={() => setIsModalOpen(true)}>
                <div className="plus-icon">+</div>
            </div>

            {isModalOpen && (
                <div className="create-reel-modal">
                    <div className="modal_overlay" onClick={closeModal}></div>
                    <div className="modal_content">
                        <div className="modal_header">
                            <h2>Create New Reel</h2>
                            <button className="close_button" onClick={closeModal}>×</button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="create-reel-form">
                            <div className="form-group">
                                <label>Upload Video</label>
                                <input
                                    type="file"
                                    accept="video/mp4"
                                    onChange={handleVideoChange}
                                    className="file-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Add a description..."
                                    rows="3"
                                />
                            </div>

                            <div className="modal_footer">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="cancel-button"
                                    disabled={isUploading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="submit-button"
                                    disabled={isUploading}
                                >
                                    {isUploading ? 'Uploading...' : 'Upload Reel'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

export default CreateReelBox;