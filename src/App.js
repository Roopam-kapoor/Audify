import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./components/HomePage/home_page";
import LoginPage from "./components/Auth/login_page";
import SignUp from "./components/Auth/sign_up";
import { useState, useEffect } from "react";
import { auth } from "./firebase";
import "./App.css";
import ProjectPage from "./components/Project/project";

function App() {
  const [userName, setUserName] = useState("");
  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        setUserName(user.displayName);
      } else setUserName("");
    });
  }, []);

  return (
    <Router>
      <div className="App">
        <div className="auth">
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/home" element={<HomePage name={userName} />} />
            <Route path="/project/:id" element={<ProjectPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
