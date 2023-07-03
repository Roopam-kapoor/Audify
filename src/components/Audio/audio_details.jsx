import React from "react";
import { AiFillDelete } from "react-icons/ai";
import { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import { onSnapshot, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const AudioDetails = ({ id, onDelete, projectName, createdDate }) => {
  const [videoDuration, setVideoDuration] = useState("");
  const handleDeleteClick = (event) => {
    onDelete(event);
  };

  useEffect(() => {
    const fetchVideoDuration = async () => {
      try {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            // User is logged in, fetch the project
            const projectDocRef = doc(db, "users", user.uid, "projects", id);
            const unsubscribeProject = onSnapshot(
              projectDocRef,
              (docSnapshot) => {
                if (docSnapshot.exists()) {
                  const data = docSnapshot.data();
                  if (videoDuration) {
                    setVideoDuration(data.videoDuration);
                  }
                }
              }
            );
            // Cleanup function to unsubscribe the project listener
            return () => {
              unsubscribeProject();
            };
          } else {
            // User is not logged in, handle the error or redirect as needed
            console.error("User is not logged in");
          }
        });

        // Cleanup function to unsubscribe the auth listener
        return () => {
          unsubscribe();
        };
      } catch (error) {
        console.error("Error fetching project:", error);
      }
    };

    fetchVideoDuration();
  }, [id]);

  return (
    <div>
      <div className="audio-details">
        <div className="audio-name">{projectName}</div>
        <div className="audio-info">
          <div className="info">Created On: {createdDate}</div>
          <div className="info">Last Modified:</div>
          <div className="info">Duration: {videoDuration}</div>
          <div className="info">Comments:</div>
        </div>
        <AiFillDelete onClick={handleDeleteClick} className="delete" />
      </div>
    </div>
  );
};

export default AudioDetails;
