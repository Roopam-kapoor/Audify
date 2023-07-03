import { useState } from "react";
import { useNavigate } from "react-router-dom";
import React from "react";
import "./auth.css";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../../firebase";

const SignUp = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    name: "",
    email: "",
    pass: "",
  });

  const [errorMsg, setErrorMsg] = useState("");
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(false);

  const handleSubmit = () => {
    if (!values.name || !values.email || !values.pass) {
      setErrorMsg("Fill all the fields");
      return;
    }
    setErrorMsg("");

    setSubmitButtonDisabled(true);
    createUserWithEmailAndPassword(auth, values.email, values.pass)
      .then(async (res) => {
        setSubmitButtonDisabled(false);
        const user = res.user;
        await updateProfile(user, {
          displayName: values.name,
        });
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
        <h1>Create Account</h1>
        <p>
          Already have an account? <a href="/">Login</a>
        </p>
        <div className="inputs">
          <input
            type="text"
            placeholder="Name"
            onChange={(event) =>
              setValues((prev) => ({ ...prev, name: event.target.value }))
            }
          />
          <br />
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
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default SignUp;
