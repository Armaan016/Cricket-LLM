import React from 'react'
import { Link } from 'react-router-dom'
import News from './News'

const Home = () => {
  const comingFromLogin = localStorage.getItem('loggedIn') ? true : false;
  console.log(comingFromLogin);
  // localStorage.clear();

  const handleLogOut = () => {
    console.log("Logging out...")
    localStorage.removeItem("loggedIn");
    window.location.reload();
  }

  return (
    <>
      {!comingFromLogin && (
        <div style={{ position: 'absolute', top: '10px', right: '10px', maxWidth: '150px' }}>
          <nav className="navbar navbar-expand-lg bg-body-tertiary" style={{ border: '2px solid gray', borderRadius: '8px', fontSize: '17px', padding: '5px' }}>
            <div class="collapse navbar-collapse" id="navbarNav">
              <ul class="navbar-nav">
                <li class="nav-item">
                  <Link class="nav-link" style={{ color: 'gray' }} aria-current="page" to='/login'>Login</Link>
                </li>
                <li class="nav-item">
                  <Link class="nav-link" style={{ color: 'gray' }} to='/register'>Register</Link>
                </li>
              </ul>
            </div>
          </nav>
          <p style={{ color: 'white', fontSize: '17px', paddingTop: '5px' }}>Access exclusive features such as chat history, and chat room by logging in!</p>
        </div>
      )}
      {comingFromLogin && (
        <Link onClick={() => handleLogOut()} style={{ position: 'absolute', right: '10px', top: '10px', fontSize: '20px' }}>Log Out</Link>
      )}
      <div className="home-page">
        <h2 className='welcome-title'>Welcome to CricketJunction</h2>
        <nav className="navbar navbar-expand-lg bg-body-tertiary" style={{ border: '2px solid gray', borderRadius: '8px', marginTop: '15px', fontSize: '17px' }}>
          <div class="container-fluid" >
            <Link style={{ color: 'blue' }} class="navbar-brand" to='/'>Home</Link>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
              <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
              <ul class="navbar-nav">
                <li class="nav-item">
                  <Link class="nav-link" style={{ color: 'gray' }} aria-current="page" to='/ipl'>IPL</Link>
                </li>
                <li class="nav-item">
                  <Link class="nav-link" style={{ color: 'gray' }} to='/t20'>T20 WC</Link>
                </li>
                <li class="nav-item">
                  <Link class="nav-link" style={{ color: 'gray' }} to='/profiles'>Player Profiles</Link>
                </li>
                <li class="nav-item">
                  <Link class="nav-link" style={{ color: 'gray' }} to='/llm'>Ask Cricbot</Link>
                </li>
                <li class="nav-item">
                  <Link class="nav-link" style={{ color: 'gray' }} to='/chatroom'>CricRoom</Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>
        <News />
      </div>
    </>
  )
}

export default Home