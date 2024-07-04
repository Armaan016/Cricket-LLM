import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!username || !password) {
            toast.error("You cannot leave any field empty!");
            return;
        }

        try {
            let response = await fetch('http://localhost:5000/login', {
                method: 'POST',
                body: JSON.stringify({ username, password }),
                headers: { 'Content-Type': 'application/json' }
            });

            const result = await response.json();

            if (response.status === 401) {
                toast.error("Invalid credentials! Please try again.");
            } else {
                toast.success("Login Successful");
                console.log('User ID:', result.userId);
                console.log('Username:', result.username);
                setTimeout(() => navigate('/'), 2500);
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("Failed to login. Please check your network connection.");
        } finally {
            setUsername('');
            setPassword('');
        }
    }

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
                    <h1>Login</h1>
                    <label htmlFor="username">Username</label>
                    <input type="text" placeholder='Enter your username here' value={username} onChange={(e) => setUsername(e.target.value)} />

                    <label htmlFor="password">Password</label>
                    <input type="password" placeholder='Enter your password here' value={password} onChange={(e) => setPassword(e.target.value)} />

                    <button type='submit' className='send-button'>Login</button>
                    <h5>Not registered yet? <Link to='/register'>Register</Link></h5>
                </form>

            </div>
        </>
    )
}

export default Login