import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar-container">
      <ul className="navbar-links">
        <li className="nav-item">
          <Link className="nav-link" to='/'>Home</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to='/ipl'>IPL</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to='/t20'>T20 WC</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to='/profiles'>Player Profiles</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to='/llm'>Ask Cricbot</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to='/chatroom'>CricRoom</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
