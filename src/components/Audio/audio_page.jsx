import React, { useState } from "react";
import axios from "axios";

const VideoUploadComponent = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);

  const [audioUrl, setAudioUrl] = useState("");
  const [convertedText, setConvertedText] = useState("");

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    const videoUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setVideoPreviewUrl(videoUrl);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("video", selectedFile);

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/extract-audio",
        formData
      );
      const body = response.data;
      console.log(body);
      setAudioUrl(body);
    } catch (error) {
      console.error(error);
    }
  };

  const convertToText = async () => {
    const formData = new FormData();
    formData.append("video", selectedFile);

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/convert",
        formData
      );
      const body = response.data;
      console.log(body);
      setConvertedText(body);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <input type="file" accept="video/*" onChange={handleVideoChange} />
      <p></p>
      {videoPreviewUrl && (
        <video controls width={600} height={340}>
          <source src={videoPreviewUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
      <p></p>
      <button onClick={handleUpload}>Extract Audio</button>
      <p></p>
      {audioUrl && (
        <div>
          <audio controls={true}>
            <source src={audioUrl} type="audio/mp3" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
      <button onClick={convertToText}>Caption</button>
      <p></p>
      <p>{convertedText}</p>
    </div>
  );
};

export default VideoUploadComponent;
