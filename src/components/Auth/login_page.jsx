import { useState } from "react";
import { useNavigate } from "react-router-dom";
import React from "react";
import "./auth.css";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";

const LoginPage = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    email: "",
    pass: "",
  });

  const [errorMsg, setErrorMsg] = useState("");
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(false);

  const handleSubmit = () => {
    if (!values.email || !values.pass) {
      setErrorMsg("Fill all the fields");
      return;
    }
    setErrorMsg("");

    setSubmitButtonDisabled(true);
    signInWithEmailAndPassword(auth, values.email, values.pass)
      .then(async (res) => {
        setSubmitButtonDisabled(false);
        navigate("/home");
      })
      .catch((err) => {
        setSubmitButtonDisabled(false);
        setErrorMsg(err.message);
      });
  };

  return (
    <div className="box-form">
      <div className="left">
        <div className="overlay">
          <h1>Audify</h1>
        </div>
      </div>

      <div className="right">
        <h5>Login</h5>
        <p>
          Don't have an account? <a href="/signup">Create Your Account</a> it
          takes less than a minute
        </p>
        <div className="inputs">
          <input
            type="email"
            placeholder="Email"
            onChange={(event) =>
              setValues((prev) => ({ ...prev, email: event.target.value }))
            }
          />
          <br />
          <input
            type="password"
            placeholder="password"
            onChange={(event) =>
              setValues((prev) => ({ ...prev, pass: event.target.value }))
            }
          />
        </div>

        <br />
        <br />
        <b className="error" style={{ lineHeight: "2rem" }}>
          {errorMsg}
        </b>
        <br />
        <button onClick={handleSubmit} disabled={submitButtonDisabled}>
          Login
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
