import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';

const LLM = () => {
    const [question, setQuestion] = useState("");
    const [chatHistory, setChatHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [typing, setTyping] = useState("");
    const comingFromLogin = localStorage.getItem('loggedIn') ? true : false;
    const [userChats, setUserChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        if (comingFromLogin && userId) {
            fetchUserChats(userId);
        }
    }, [comingFromLogin, userId]);

    const fetchUserChats = async (userId) => {
        try {
            const response = await fetch(`http://localhost:5000/chats/${userId}`);
            let chats = await response.json();

            chats = chats.map(chat => ({
                ...chat,
                conversations: chat.conversations.map(conversation => ({
                    question: conversation.question,
                    answer: conversation.answer,
                    _id: conversation._id,
                    createdAt: conversation.createdAt,
                    updatedAt: conversation.updatedAt
                }))
            }));

            setUserChats(chats);
        } catch (error) {
            console.error("Failed to fetch user chats: ", error);
        }
    };

    const handleChatClick = (chat) => {
        if (chat && chat.conversations) {
            setSelectedChat(chat);
            setChatHistory(chat.conversations);
        } else {
            setSelectedChat(null);
            setChatHistory([]);
        }
    };

    const createNewChat = async () => {
        try {
            const response = await fetch('http://localhost:5000/chats', {
                method: 'POST',
                body: JSON.stringify({ userId }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const newChat = await response.json();
            setUserChats([...userChats, newChat]);
            setSelectedChat(newChat);
            setChatHistory([]);
        } catch (error) {
            console.error("Failed to create new chat: ", error);
        }
    };

    const deleteChat = async (chatId) => {
        try {
            await fetch(`http://localhost:5000/chats/${chatId}`, { method: 'DELETE' });
            setUserChats(userChats.filter(chat => chat._id !== chatId));
            // createNewChat();

            toast.success('Chat deleted successfully');
        } catch (error) {
            console.error("Failed to delete chat: ", error);
            toast.error('Failed to delete chat');
        }
    };

    const handleQuestion = async (e) => {
        e.preventDefault();
        if (!question.trim()) {
            toast.error("Enter a question first!");
            return;
        }
        setLoading(true);
        setTyping("");
        try {
            let result = await fetch('http://localhost:5000/llm', {
                method: "POST",
                body: JSON.stringify({ question, userId, chatId: selectedChat?._id }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            result = await result.json();
            if (result && result.response) {
                const newChatHistory = [...chatHistory, { question, answer: result.response }];
                setChatHistory(newChatHistory);
                if (selectedChat) {
                    setSelectedChat({ ...selectedChat, conversations: newChatHistory });
                }
                simulateTyping(result.response);
                setQuestion("");
            } else {
                toast.error("Failed to get a valid response! Please try again.");
            }
        } catch (error) {
            console.error("Error: ", error);
        }
        setLoading(false);
    };

    const simulateTyping = (text = "") => {
        let index = -1;
        setTyping("");
        const interval = setInterval(() => {
            setTyping((prev) => prev + text.charAt(index));
            index++;
            if (index >= text.length) {
                clearInterval(interval);
            }
        }, 30);
    };

    return (
        <div className='main-wrapper'>
            {!comingFromLogin && (
                <div style={{ position: 'absolute', top: '10px', left: '10px', maxWidth: '150px' }}>
                    <nav className="navbar navbar-expand-lg bg-body-tertiary" style={{ border: '2px solid gray', borderRadius: '8px', fontSize: '17px', padding: '5px' }}>
                        <div className="collapse navbar-collapse" id="navbarNav">
                            <ul className="navbar-nav">
                                <li className="nav-item">
                                    <Link className="nav-link" style={{ color: 'gray' }} aria-current="page" to='/login'>Login</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" style={{ color: 'gray' }} to='/register'>Register</Link>
                                </li>
                            </ul>
                        </div>
                    </nav>
                </div>
            )}

            {comingFromLogin && (
                <div className='user-chats-container'>
                    <h4>Previous Chats</h4>
                    {userChats.length === 0 ? (
                        <p style={{ color: 'black' }}>No chats to display</p>
                    ) : (
                        <ul>
                            {userChats.map((chat, index) => (
                                <li key={index} onClick={() => handleChatClick(chat)}>
                                    <Link style={{ color: 'white' }}>Chat {index + 1} - {new Date(chat.createdAt).toLocaleString()}</Link>
                                    <button className='send-button' style={{ padding: '4px', marginLeft: '4px' }} onClick={() => deleteChat(chat._id)}>Delete Chat</button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
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

            {comingFromLogin ? (
                <div className='chatbot-container'>
                    <h2 style={{ color: 'white' }}>CricBot</h2>
                    {chatHistory.length > 0 && (
                        <>
                            <div className='chat-messages'>
                                {chatHistory.length > 0 && chatHistory.map((item, index) => (
                                    <div key={index}>
                                        <p className='questions'>{item?.question ?? "No question"}</p>
                                        <div className='answers'>
                                            {typing && index === chatHistory.length - 1 ? (
                                                <span className='typing-indicator'>{typing}</span>
                                            ) : (
                                                item?.answer ?? "No answer"
                                            )}
                                        </div>
                                        <br />
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                    <button className='new-chat-button' onClick={createNewChat}>New Chat</button>
                    {loading && (
                        <div className='loading-dots'>
                            Loading Response
                            <span>.</span><span>.</span><span>.</span>
                        </div>
                    )}
                    <form className='chat-input-container' onSubmit={handleQuestion}>
                        <input
                            type="text"
                            name="question"
                            id="question"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="Enter your question here"
                            className='chat-input'
                            disabled={!comingFromLogin}
                        />
                        <button className='chat-send-button' type="submit" disabled={!comingFromLogin}>Ask CricBot</button>
                    </form>
                </div>
            ) : (
                <div className='chatbot-disabled-container'>
                    <h2 className='chatbot-title' style={{ margin: '10px' }}>CricBot</h2>
                    <p className='login-prompt' style={{ color: 'gray', fontSize: '20px' }}>Please log in to access CricBot and see previous chats.</p>
                </div>
            )}
        </div>
    );
};

export default LLM;
