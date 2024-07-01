import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { v4 as uuidv4 } from 'uuid';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LLM = () => {
    const [question, setQuestion] = useState("");
    const [chatHistory, setChatHistory] = useState([]);
    const [sessionId, setSessionId] = useState("");
    const [loading, setLoading] = useState(false);
    const [typing, setTyping] = useState("");

    useEffect(() => {
        if (!sessionId) {
            setSessionId(uuidv4());
        }
        console.log("New session ID: ", sessionId);
    }, [sessionId]);

    const clearChat = () => {
        setChatHistory([]);
        window.location.reload();
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
                body: JSON.stringify({ question, sessionId }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            result = await result.json();
            // console.log(result.response);
            setChatHistory([...chatHistory, { question, answer: result.response }]);
            simulateTyping(result.response);
            setQuestion("");
        } catch (error) {
            console.error("Error: ", error);
        }
        setLoading(false);
    };

    const simulateTyping = (text) => {
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
            <div className='chatbot-container'>
                <h2 className='chatbot-title'>CricBot</h2>
                {chatHistory.length > 0 && (
                    <>
                        <div className='chat-messages'>
                            {chatHistory.map((item, index) => (
                                <div key={index}>
                                    <p className='questions'>{item.question}</p>
                                    <div className='answers'>
                                        {typing && index === chatHistory.length - 1 ? (
                                            <span className='typing-indicator'>{typing}</span>
                                        ) : (
                                            item.answer
                                        )}
                                    </div>
                                    <br />
                                </div>
                            ))}
                        </div>
                        <button className='clear-chat-button' onClick={clearChat}>Clear Chat</button>
                    </>
                )}
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
                    />
                    <button className='chat-send-button' type="submit">Ask CricBot</button>
                </form>
            </div>
        </div>
    );
};

export default LLM;
