import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); 
  const [name, setName] = useState(""); 
  const [profilePic, setProfilePic] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false); 
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); 
  const [passwordStrength, setPasswordStrength] = useState("");
  const navigate = useNavigate();

  const checkPasswordStrength = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);

    if (password.length < minLength) {
      return "Password must be at least 8 characters long";
    }
    if (!hasUpperCase) {
      return "Password must contain at least one uppercase letter";
    }
    if (!hasLowerCase) {
      return "Password must contain at least one lowercase letter";
    }
    if (!hasNumbers) {
      return "Password must contain at least one number";
    }
    if (!hasSpecialChar) {
      return "Password must contain at least one special character";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const passwordError = checkPasswordStrength(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!termsAccepted) {
      setError("You must accept the terms and conditions");
      return;
    }

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("name", name);
    if (profilePic) {
      formData.append("profilePic", profilePic);
    }

    try {
      const res = await axios.post("http://localhost:4000/signup", formData);
      localStorage.setItem("token", res.data.token);
      setSuccessMessage("Signup successful! A welcome email has been sent to your email address.");
      setTimeout(() => {
        setSuccessMessage("");
        navigate("/login");
      }, 5000);
    } catch (err) {
      setError(err.response.data.error || "Signup failed. Try again.");
    }
  };

  return (
    <div class="h">
     <h1>Welcome to the world of MelodyVerse!</h1>
    <div className="signup-container">
      <h2>Sign Up</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
      <form onSubmit={handleSubmit}>
        <input
          className="name"
          type="text"
          placeholder="Name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
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
          onChange={(e) => {
            setPassword(e.target.value);
            setPasswordStrength(checkPasswordStrength(e.target.value));
          }}
          required
        />
        {passwordStrength && <p style={{ color: "orange" }}>{passwordStrength}</p>}
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <input type="file" onChange={(e) => setProfilePic(e.target.files[0])} />
        <label>
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={() => setTermsAccepted(!termsAccepted)}
          />
          I accept the terms and conditions
        </label>
        <button type="submit">Sign Up</button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
    </div>
  );
};

export default Signup;
