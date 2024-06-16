import React, { useState } from 'react';
import Navbar from './Navbar';

const T20 = () => {
  const [year, setYear] = useState('');
  const [pointsTable, setPointsTable] = useState({});
  const [winner, setWinner] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/t20', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ year }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch points table');
      }

      const data = await response.json();
      const parsedResponse = JSON.parse(data.response);

      setPointsTable(parsedResponse);
      setWinner(parsedResponse.winner || '');
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <>
      <div className='navbar-wrapper'>
        <Navbar />
      </div>
      <div className='ipl-form-container'>
        <h1>T20 World Cup Standings</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="year">Select Year:</label>
          <select
            id="year"
            value={year}
            style={{ color: 'green' }}
            onChange={(e) => setYear(e.target.value)}
            required
          >
            <option value="" disabled>Select year</option>
            <option value="2007">2007</option>
            <option value="2009">2009</option>
            <option value="2010">2010</option>
            <option value="2012">2012</option>
            <option value="2014">2014</option>
            <option value="2016">2016</option>
            <option value="2021">2021</option>
            <option value="2022">2022</option>
            <option value="2024">2024</option>
          </select>
          <button type="submit" className='send-button'>Get Standings</button>
        </form>
        {loading && (
          <div className='loading-dots'>
            Loading Table
            <span>.</span><span>.</span><span>.</span>
          </div>
        )}
        {Object.keys(pointsTable).length > 0 ? (
          <div className='ipl-table'>
            {Object.entries(pointsTable).map(([group, tableData], index) => (
              group !== 'winner' && (
                <div key={index} className='ipl-table'>
                  <h2 className='ipl-winner-title'>{group}</h2>
                  <table>
                    <thead>
                      <tr>
                        {tableData[0]
                          .filter(header => header !== 'Series Form' && header !== 'For' && header!== 'Against')
                          .map((header, idx) => (
                            <th key={idx}>{header}</th>
                          ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.slice(1).map((row, idx) => (
                        <tr key={idx}>
                          {row
                            .filter((_, i) => tableData[0][i] !== 'Series Form' && tableData[0][i] !== 'For' && tableData[0][i]!== 'Against')
                            .map((cell, i) => (
                              <td key={i}>{cell}</td>
                            ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ))}
            <h2 className='ipl-winner-title'>Winner: {winner}</h2>
          </div>
        ) : (
          <p>Please select a year to display standings.</p>
        )}
      </div>
    </>
  );
};

export default T20;
