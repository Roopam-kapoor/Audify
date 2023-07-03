import React, { useState, useEffect, useRef } from "react";
import ReactPlayer from "react-player";
import { GrLogout } from "react-icons/gr";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db, storage } from "../../firebase";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  getDownloadURL,
  ref,
  uploadBytes,
  deleteObject,
  getMetadata,
} from "firebase/storage";
import { doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import "./project.css";

const ProjectPage = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videoFile, setVideoFile] = useState(null);
  const [videoLink, setVideoLink] = useState("");
  const [previewURL, setPreviewURL] = useState("");
  const [uploading, setUploading] = useState(false);
  const [extractedAudioFile, setExtractedAudioFile] = useState(null);
  const [extractedAudioURL, setExtractedAudioURL] = useState("");
  const [captions, setCaptions] = useState("");
  const [loadingCaptions, setLoadingCaptions] = useState(false);
  
  const playerRef = useRef(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        // Add the onAuthStateChanged listener to check for user authentication state changes
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            // User is logged in, fetch the project
            const projectDocRef = doc(db, "users", user.uid, "projects", id);
            const unsubscribeProject = onSnapshot(
              projectDocRef,
              (docSnapshot) => {
                if (docSnapshot.exists()) {
                  const data = docSnapshot.data();
                  setProject(data);
                  const videoSrc = data.videoSrc;
                  if (videoSrc) {
                    setPreviewURL(videoSrc);
                  }
                  const audioSrc = data.audioSrc;
                  if (audioSrc) {
                    setExtractedAudioURL(audioSrc);
                  }
                  const captionsData = data.captions;
                  if (captionsData) {
                    setCaptions(captionsData);
                  }
                } else {
                  console.log("Project not found");
                }
                setLoading(false);
              }
            );

            // Cleanup function to unsubscribe the project listener
            return () => {
              unsubscribeProject();
            };
          } else {
            // User is not logged in, handle the error or redirect as needed
            console.error("User is not logged in");
            setLoading(false);
          }
        });

        // Cleanup function to unsubscribe the auth listener
        return () => {
          unsubscribe();
        };
      } catch (error) {
        console.error("Error fetching project:", error);
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  useEffect(() => {
    const handleYouTubeAPIError = (event) => {
      // Handle the YouTube API error gracefully
      console.error("YouTube API error:", event.data);
    };

    // Add the event listener for YouTube API error
    window.addEventListener("error", handleYouTubeAPIError);

    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener("error", handleYouTubeAPIError);
    };
  }, []);


  if (loading) {
    return <p>Loading project..</p>; // Render a loading message while the project is being fetched
  }

  const handleSignOut = async () => {
    try {
      const confirm = window.confirm("Are you sure?");
      if (confirm) {
        await signOut(auth);
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    setVideoFile(file);
    setVideoLink(""); // Reset the videoLink value when a file is selected
    try {
      const storageRef = ref(storage, `videos/${id}/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      setPreviewURL(downloadURL);
      await updateProject(id, { videoSrc: downloadURL });
      console.log("Video file uploaded successfully");
    } catch (error) {
      console.error("Error uploading video file:", error);
    }
  };
  

  const handleVideoLinkChange = (e) => {
    setVideoLink(e.target.value);
  };

  const handleVideoSubmit = async (e) => {
    e.preventDefault();

    if (videoFile || videoLink) {
      setUploading(true);

      if (videoFile) {
        const storageRef = ref(storage, `videos/${id}/${videoFile.name}`);
        await uploadBytes(storageRef, videoFile);
        const downloadURL = await getDownloadURL(storageRef);
        setPreviewURL(downloadURL);
        await updateProject(id, { videoSrc: downloadURL });
      } else {
        setPreviewURL(videoLink);
        await updateProject(id, { videoSrc: videoLink });
      }

      // Update Firestore with the video duration
      await updateProject(id, { videoDuration: videoDuration });

      setVideoFile(null);
      setVideoLink("");
    }
  };
  const handleRemoveVideo = async () => {
    if (previewURL) {
      try {
        // Delete the video file from Firebase Storage
        if (videoFile && videoFile.name) {
          const storageRef = ref(storage, `videos/${id}/${videoFile.name}`);
          await deleteObject(storageRef);
        } else if (videoLink) {
          // Extract the video file name from the video link
          const urlParts = videoLink.split("/");
          const videoFileName = urlParts[urlParts.length - 1];
          const storageRef = ref(storage, `videos/${id}/${videoFileName}`);
          await deleteObject(storageRef);
        }

        // Update the video source in the project
        await updateProject(id, { videoSrc: "" });
        await updateProject(id, { videoDuration: "" });

        // Clear the preview URL
        setPreviewURL("");

        console.log("Video file deleted successfully");
      } catch (error) {
        console.error("Error deleting video from storage:", error);
      }
    }
  };

  const updateProject = async (projectId, data) => {
    try {
      const projectRef = doc(
        db,
        "users",
        auth.currentUser.uid,
        "projects",
        projectId
      );
      const projectDoc = await getDoc(projectRef);

      if (projectDoc.exists()) {
        // Merge the existing data with the updated data
        const updatedData = { ...projectDoc.data(), ...data };
        await updateDoc(projectRef, updatedData);
      } else {
        console.log("Project not found");
      }
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };

  const handleExtractAudio = async () => {
    try {
      const response = await axios.post("http://127.0.0.1:5000/extract-audio", {
        videoURL: previewURL,
      });

      const audioURL = response.data.audioFile;
      console.log(audioURL);

      if (audioURL && audioURL.startsWith("http")) {
        const audioFileResponse = await axios.get(audioURL, {
          responseType: "blob",
        });

        const audioBlob = audioFileResponse.data;
        const audioFile = new File([audioBlob], "extracted_audio.mp3", {
          type: "audio/mpeg",
        });
        console.log(audioFile);
        setExtractedAudioFile(audioFile); // Set the extractedAudioFile

        const storageRef = ref(storage, `audios/${id}/${audioFile.name}`);
        await uploadBytes(storageRef, audioFile); // Upload the audioFile
        const downloadURL = await getDownloadURL(storageRef);

        await updateProject(id, { audioSrc: downloadURL });
        setExtractedAudioURL(downloadURL);
      } else {
        console.error("Invalid audio URL:", audioURL);
      }
    } catch (error) {
      console.error("Error extracting audio:", error);
    }
  };

  const handleRemoveAudio = async () => {
    if (extractedAudioURL) {
      const storageRef = ref(
        storage,
        `audios/${id}/${extractedAudioFile.name}`
      );
      try {
        // Check if the audio file exists
        const metadata = await getMetadata(storageRef);
        if (metadata) {
          await deleteObject(storageRef);
        } else {
          console.log("Audio file does not exist");
        }
      } catch (error) {
        console.error("Error deleting audio from storage:", error);
      }
    }

    await updateProject(id, { audioSrc: "" });

    setExtractedAudioURL("");
  };

  const handleCaptionGeneration = async () => {
    try {
      setLoadingCaptions(true);
      const response = await axios.post(
        "http://127.0.0.1:5000/generate-captions",
        {
          videoURL: previewURL,
        }
      );

      const captionData = response.data.captions;
      console.log(captionData);

      await updateProject(id, { captions: captionData });
      setCaptions(captionData);
      setLoadingCaptions(false);
    } catch (error) {
      console.error("Error generating captions:", error);
      setLoadingCaptions(false);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <div className="title ">
          <a href="/home" style={{ textDecoration: "none" }} className="title">
            Audify
          </a>
        </div>
        <GrLogout
          style={{ color: "white" }}
          size={30}
          className="logout"
          onClick={handleSignOut}
        />
      </div>
      <div className="project-container">
        {project ? (
          <>
            <h1 className="project-name">{project?.projectName}</h1>
            <h2>Video</h2>
            {previewURL ? (
              <div className="video-preview">
                <ReactPlayer
                  url={previewURL}
                  controls
                  width={400}
                  height={250}
                  ref={playerRef}
                  style={{ margin: "auto" }}
                />
                <p></p>
                <button className="remove-button" onClick={handleRemoveVideo}>
                  Remove
                </button>
                <p></p>
                {extractedAudioURL ? (
                  <div>
                    <h3>Audio</h3>
                    <audio src={extractedAudioURL} controls />
                    <p></p>
                    <button
                      className="remove-button"
                      onClick={handleRemoveAudio}
                    >
                      Remove Audio
                    </button>
                    <p></p>
                    {captions ? (
                      <div>
                        <h3>Captions</h3>
                        {loadingCaptions ? (
                          <p>Loading captions...</p>
                        ) : (
                          <>
                            <textarea
                              style={{
                                width: "80%",
                                height: "auto",
                                color: "black",
                                borderRadius: "15px",
                                padding: "1.5vmax",
                              }}
                              className="captions-textarea"
                              value={captions}
                              readOnly
                            ></textarea>
                            <p></p>
                            <button
                              className="Extract-button"
                              onClick={handleCaptionGeneration}
                            >
                              Regenerate Captions
                            </button>
                          </>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={handleCaptionGeneration}
                        disabled={loadingCaptions}
                        className="Extract-button"
                      >
                        Generate Captions
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    className="Extract-button"
                    onClick={handleExtractAudio}
                  >
                    Extract Audio
                  </button>
                )}
              </div>
            ) : (
              <div className="upload-box">
                {uploading ? (
                  <p>Uploading...</p>
                ) : (
                  <>
                    <label for="video" class="drop-container">
                      <span class="drop-title">Drop files here</span>
                      <input
                        type="file"
                        id="video"
                        accept="video/*"
                        onChange={handleFileUpload}
                        required
                      ></input>
                    </label>
                    <div className="or-divider">
                      <h3>OR</h3>
                    </div>
                    <input
                      type="text"
                      value={videoLink}
                      onChange={handleVideoLinkChange}
                      className="video-link"
                      placeholder="Enter a video link"
                    />
                    <button
                      className="video-button"
                      onClick={handleVideoSubmit}
                    >
                      Submit
                    </button>
                  </>
                )}
              </div>
            )}
          </>
        ) : (
          <p>Loading project...</p>
        )}
      </div>
    </div>
  );
};

export default ProjectPage;
