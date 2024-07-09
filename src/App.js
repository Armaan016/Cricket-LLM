// import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Components/Home';
import Ipl from './Components/Ipl';
import T20 from './Components/T20'
import LLM from './Components/LLM';
import Profiles from './Components/Profiles';
import Login from './Components/Login';
import Register from './Components/Register';
import ChatRoom from './Components/ChatRoom';

function App() {
  return (
    <div className='app-wrapper'>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/ipl' element={<Ipl />} />
          <Route path='/t20' element={<T20 />} />
          <Route path='/llm' element={<LLM />} />
          <Route path='/profiles' element={<Profiles />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/chatroom' element={<ChatRoom />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
