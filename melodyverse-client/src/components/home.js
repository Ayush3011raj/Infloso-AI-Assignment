import React from 'react';
import './home.css';  
const Home = () => {
  return (
    <div className="home-container">
      <h1>Welcome to MelodyVerse!</h1>
      <p>Your personalized music streaming experience.</p>

      <div className="music-features">
        <h2>Explore our Features</h2>
        <div className="feature-item">
          <img src="/image1.jpg" alt="Feature 1" />
          <p>Create and Share Playlists</p>
        </div>
        <div className="feature-item">
          <img src="/image2.jpg" alt="Feature 2" />
          <p>Discover New Artists and Songs</p>
        </div>
        <div className="feature-item">
          <img src="./image3.jpg" alt="Feature 3" />
          <p>Stream Music in High Quality</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
