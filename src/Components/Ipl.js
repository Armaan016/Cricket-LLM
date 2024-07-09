import React, { useState } from 'react';
import Navbar from './Navbar';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'

const Ipl = () => {
  const [year, setYear] = useState('');
  const [pointsTable, setPointsTable] = useState([]);
  const [winner, setWinner] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!year) {
      toast.error("Please select a year!");
      return;
    }
    setLoading(true);
    try {
      console.log("Sending year to backend");
      const response = await fetch('http://localhost:5000/ipl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ year })
      });
      if (!response.ok) {
        throw new Error('Failed to fetch points table');
      }
      const data = await response.json();
      console.log('Received data:', data);

      const parsedResponse = JSON.parse(data.response);
      console.log('parsedResponse:', parsedResponse);

      setPointsTable(parsedResponse.points_table || []);
      setWinner(parsedResponse.winner || '');
      setError('');
      setYear(e.target.value);
    } catch (error) {
      console.error(error);
      setError('Failed to fetch points table');
    }
    setLoading(false)
  };

  return (
    <div className='page-wrapper'>
      <ToastContainer
        position="top-center"
        className='toasts'
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ background: 'none' }}
      />
      <div className='navbar-wrapper'>
        <Navbar />
      </div>
      <div className='ipl-form-container'>
        <h1>IPL Points Table</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="year">Select Year:</label>
          <select
            id="year"
            style={{ color: 'gray' }}
            value={year}
            onChange={(e) => setYear(e.target.value)}
            required
          >
            <option value="" disabled>Select year</option>
            {Array.from({ length: 17 }, (_, i) => 2008 + i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <button type="submit" className='send-button'>Get Points Table</button>
        </form>
        {loading && (
          <div className='loading-dots'>
            Loading Table
            <span>.</span><span>.</span><span>.</span>
          </div>
        )}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {pointsTable.length > 0 ? (
          <div className='ipl-table'>
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Team Name</th>
                  <th>Played</th>
                  <th>Won</th>
                  <th>Lost</th>
                  <th>N/R</th>
                  <th>NRR</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                {pointsTable.map((row, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{index < 9 ? row.team_name : row.team_name.slice(1)}</td>
                    <td>{row.played}</td>
                    <td>{row.wins}</td>
                    <td>{row.lost}</td>
                    <td>{row.nr}</td>
                    <td>{row.nrr}</td>
                    <td>{row.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <h2 className='ipl-winner-title'>Winner: {winner}</h2>
          </div>
        ) : (
          <p>Please select a year to display points table.</p>
        )}
      </div>
    </div>
  );
};

export default Ipl;
