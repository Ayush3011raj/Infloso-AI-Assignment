import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  // validating empty fields
  const validateFields = () => {
    if (!email) {
      setError("Email cannot be empty");
      return false;
    }
    if (!password) {
      setError("Password cannot be empty");
      return false;
    }

    setError(""); 
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFields()) {
      return;
    }

    try {
      const res = await axios.post("http://localhost:4000/login", { email, password });
      localStorage.setItem("token", res.data.token);
      setSuccessMessage("Logged in successfully!");
      setError(""); 
      setTimeout(() => {
        setSuccessMessage("");
        navigate("/home"); // Redirect to the home page 
      }, 3000);
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <div class="h">
      <h1>Welcome to the World of MelodyVerse!</h1>
    <div className="login-container">
      <h2>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>} 
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>} 
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      <p>
        Don't have an account? <Link to="/signup">Sign up</Link>
      </p>
      <p>
        <Link to="/forgot-password">Forgot Password?</Link>
      </p>
    </div>
    </div>
  );
};

export default Login;
