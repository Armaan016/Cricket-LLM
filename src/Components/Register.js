import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !email || !password) {
      toast.error("You cannot leave any field empty!");
      return;
    }

    try {
      let response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password }),
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();

      if (response.status === 201) {
        toast.success("Registration Successful");
        localStorage.setItem('token', result.token);
        console.log('JWT Token:', result.token);
        console.log('Username:', result.username);
        setTimeout(() => navigate('/login'), 2500);
      } else {
        toast.error(result.error || "Registration failed! Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to register. Please check your network connection.");
    } finally {
      setUsername('');
      setEmail('');
      setPassword('');
    }
  };

  return (
    <>
      <Link to='/' style={{ position: 'absolute', top: '5px', right: '15px' }}>Go to Home Page</Link>
      <div className='ipl-form-container'>
        <ToastContainer
          position="top-center"
          className='toasts'
          autoClose={1500}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <form onSubmit={handleSubmit}>
          <h1>Register</h1>
          <label htmlFor="username">Username</label>
          <input type="text" placeholder='Enter your username here' value={username} onChange={(e) => setUsername(e.target.value)} />

          <label htmlFor="email">Email</label>
          {/* <p style={{ fontSize: '15px' }}>An OTP will be sent to this email address for verification</p> */}
          <input type="email" placeholder='Enter your email here' value={email} onChange={(e) => setEmail(e.target.value)} />

          <label htmlFor="password">Password</label>
          <input type="password" placeholder='Enter your password here' value={password} onChange={(e) => setPassword(e.target.value)} />

          <button type='submit' className='send-button'>Register</button>
          <h5>Already registered? <Link to='/login'>Click here to login</Link></h5>
        </form>
      </div>
    </>
  );
};

export default Register;
