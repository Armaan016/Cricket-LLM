import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { v4 as uuidv4 } from 'uuid';

const LLM = () => {
    const [question, setQuestion] = useState("");
    const [chatHistory, setChatHistory] = useState([]);
    const [sessionId, setSessionId] = useState("");
    const [loading, setLoading] = useState(false);

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
            alert("Enter a question first!");
            return;
        }
        setLoading(true);
        try {
            let result = await fetch('http://localhost:5000/llm', {
                method: "POST",
                body: JSON.stringify({ question, sessionId }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            result = await result.json();
            setChatHistory([...chatHistory, { question, answer: result.response }]);
            setQuestion("");
        } catch (error) {
            console.error("Error: ", error);
        }
        setLoading(false);
    };

    return (
        <>
            <div className='navbar-wrapper'>
                <Navbar />
            </div>
            <div className='chatbot-container'>
                <h2 className='ipl-title'>CricBot</h2>
                {chatHistory.length > 0 && (
                    <>
                        <div className='chat-messages'>
                            {chatHistory.map((item, index) => (
                                <div key={index}>
                                    <div className='questions'>{item.question}</div>
                                    <div className='answers'>{item.answer}</div>
                                    <br />
                                </div>
                            ))}
                        </div>
                        <button className='clear-chat-button' onClick={clearChat}>Clear Chat</button>
                    </>
                )}
                {loading && (
                    <div class="loader">
                        <div class="scanner">
                            <span>Loading....</span>
                        </div>
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
        </>
    );
};

export default LLM;
