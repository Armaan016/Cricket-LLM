import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import playerProfiles from '../player_profiles.json';

const Profiles = () => {
  const [name, setName] = useState("");
  const [playerData, setPlayerData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [allPlayerNames, setAllPlayerNames] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  const capitalizeFirstLetters = (name) => {
    return name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  useEffect(() => {
    const playerNames = Object.keys(playerProfiles).map(capitalizeFirstLetters);
    setAllPlayerNames(playerNames);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name) {
      alert("Enter a player name first!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();
      console.log('Received data:', data);

      if (data.error) {
        setError(data.error);
        setPlayerData(null);
      } else {
        setPlayerData(data);
        setError("");
      }
    } catch (error) {
      console.error(error);
      setError("Failed to fetch player data");
      setPlayerData(null);
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const input = e.target.value;
    setName(input);

    if (input) {
      const filteredSuggestions = allPlayerNames.filter(playerName =>
        playerName.toLowerCase().includes(input.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setName(suggestion);
    setSuggestions([]);
  };

  return (
    <>
      <div className='profile-page-container'>
        <div className='ipl-form-container'>
          <h1 className='ipl-title'>Player Profiles</h1>
          <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
            <input
              type="text"
              value={name}
              className='chat-input'
              style={{ margin: '8px' }}
              onChange={handleInputChange}
              placeholder='Enter player name'
              autoComplete="off"
            />
            {suggestions.length > 0 && (
              <ul className='suggestions-list'>
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
            <button className='send-button' style={{ marginTop: '5px' }} type='submit'>Get Profile</button>
          </form>
          {loading && (
            <div className='loading-dots'>
              Loading Profile
              <span>.</span><span>.</span><span>.</span>
            </div>
          )}
          {error && <div className="error">{error}</div>}
          {playerData && (
            <div className='player-details'>
              <div className='player-info'>
                <div className='player-details-left'>
                  <img
                    src={playerData['image_url']}
                    alt={`${playerData['Full Name']}`}
                    className='player-image'
                  />
                  <h2 className='player-name'>{playerData['Full Name']}</h2>
                </div>
                <div className='player-details-right'>
                  <p><strong>Age:</strong> {playerData['Age']}</p>
                  <p><strong>Batting Style:</strong> {playerData['Batting Style']}</p>
                  <p><strong>Bowling Style:</strong> {playerData['Bowling Style']}</p>
                  <p><strong>Playing Role:</strong> {playerData['Playing Role']}</p>
                  <p><strong>Born:</strong> {playerData['Born']}</p>
                </div>
              </div>

              <h3 className='player-name'>Batting Stats</h3>
              <table className='ipl-table'>
                <thead>
                  <tr>
                    {Object.keys(playerData['Batting_Stats']).map(key => <th key={key}>{key}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {playerData['Batting_Stats']['Format'].map((_, idx) => (
                    <tr key={idx}>
                      {Object.keys(playerData['Batting_Stats']).map(key => (
                        <td key={key}>{playerData['Batting_Stats'][key][idx]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              <h3 className='player-name'>Bowling Stats</h3>
              <table className='ipl-table' style={{ marginLeft: '20px' }}>
                <thead>
                  <tr>
                    {Object.keys(playerData['Bowling_Stats']).map(key => <th key={key}>{key}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {playerData['Bowling_Stats']['Format'].map((_, idx) => (
                    <tr key={idx}>
                      {Object.keys(playerData['Bowling_Stats']).map(key => (
                        <td key={key}>{playerData['Bowling_Stats'][key][idx]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              <h3 className='player-name'>Recent Matches</h3>
              <table className='ipl-table' style={{ margin: 'auto', width: '92%' }}>
                <thead>
                  <tr>
                    {Object.keys(playerData['Recent_Matches']).map(key => <th key={key}>{key}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {playerData['Recent_Matches']['Match'].map((_, idx) => (
                    <tr key={idx}>
                      {Object.keys(playerData['Recent_Matches']).map(key => (
                        <td key={key}>{playerData['Recent_Matches'][key][idx]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {playerData['videos'] && (
                <div className='player-videos'>
                  <h3 className='player-name'>Player Videos</h3>
                  <div className='videos-list'>
                    {playerData['videos'].map((videoUrl, idx) => (
                      <div key={idx} className='video-container'>
                        <iframe
                          width="300"
                          height="200"
                          src={videoUrl.replace("watch?v=", "embed/")}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title={`Video ${idx + 1}`}
                        ></iframe>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
      <div className='navbar-wrapper'>
        <Navbar />
      </div>
    </>
  );
}

export default Profiles;
