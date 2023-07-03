import React, { useState, useEffect } from "react";
import { RiAddCircleFill } from "react-icons/ri";
import { GrLogout } from "react-icons/gr";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebase";
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  getDocs,
  doc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import AudioDetails from "../Audio/audio_details";
import "./home_page.css";

const HomePage = (props) => {
  const [divs, setDivs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(true); // Added loading state
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          const querySnapshot = await getDocs(
            collection(db, "users", user.uid, "projects")
          );
          const projects = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setDivs(projects);
        } else {
          console.log("User is not authenticated");
        }
        setLoading(false); // Set loading state to false after authentication status is determined
      });
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const handleSignOut = () => {
    const confirm = window.confirm("Are you sure?");
    if (confirm) {
      signOut(auth);
      navigate("/");
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const currentUser = auth.currentUser;

    const projectData = {
      projectName: projectName,
      createdDate: new Date().toLocaleDateString(),
    };

    try {
      const docRef = await addDoc(
        collection(getFirestore(), "users", currentUser.uid, "projects"),
        projectData
      );
      const newProject = { id: docRef.id, ...projectData };
      setDivs((prevDivs) => [...prevDivs, newProject]);
      setShowForm(false);
      setProjectName("");
      navigate("/project/" + docRef.id);
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  const handleDelete = async (event, id) => {
    event.stopPropagation(); // Stop event propagation
    try {
      const currentUser = auth.currentUser;
      await deleteDoc(
        doc(getFirestore(), "users", currentUser.uid, "projects", id)
      );
      setDivs((prevDivs) => prevDivs.filter((div) => div.id !== id));
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const handleDivClick = (event, id) => {
    event.stopPropagation(); // Stop event propagation
    navigate("/project/" + id);
  };

  // Render loading state if authentication status is not determined
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="home">
      <div className="container">
        <div className="header">
          <div className="title">Audify</div>
          <GrLogout
            style={{ color: "white" }}
            size={30}
            className="logout"
            onClick={handleSignOut}
          />
        </div>
        <div className="main-box">
          <h1 style={{ fontSize: "40px" }}>Hey {props.name}</h1>
          <h3>Here are your recent audios</h3>
          <div className="info-box">
            {divs.map((div) => (
              <div
                key={div.id}
                className="audio-box"
                onClick={(event) => handleDivClick(event, div.id)}
              >
                <AudioDetails
                  id={div.id}
                  projectName={div.projectName}
                  createdDate={div.createdDate}
                  onDelete={(event) => handleDelete(event, div.id)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="add-project">
        {showForm ? (
          <form
            onSubmit={handleFormSubmit}
            className="create-project-form"
            id="create-project-form"
          >
            <input
              type="text"
              className="project-input"
              placeholder="Enter project name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
            <button type="submit" style={{ width: 100, height: 60 }}>
              Create
            </button>
          </form>
        ) : (
          <RiAddCircleFill
            onClick={() => setShowForm(true)}
            size={100}
            color="rgb(14, 61, 22)"
          />
        )}
      </div>
    </div>
  );
};

export default HomePage;
