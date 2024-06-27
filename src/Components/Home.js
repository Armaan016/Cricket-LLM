import React from 'react'
import { Link } from 'react-router-dom'
import News from './News'

const Home = () => {
  return (
    <>
      <div className="home-page">
        <h2 className='welcome-title'>Welcome to CricketJunction</h2>
        <nav className="navbar navbar-expand-lg bg-body-tertiary" style={{ border: '2px solid gray', borderRadius: '8px', marginTop: '15px', fontSize: '17px'}}>
          <div class="container-fluid" >
            <Link style={{ color: 'green' }} class="navbar-brand" to='/'>Home</Link>
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