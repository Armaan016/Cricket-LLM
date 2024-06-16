import React, { useState } from 'react';
import Navbar from './Navbar'

const LLM = () => {
    const [question, setQuestion] = useState("");
    const [chatHistory, setChatHistory] = useState([])
    const [loading, setLoading] = useState(false);

    const clearChat = () => {
        setChatHistory([]);
    };

    const handleQuestion = async (e) => {
        e.preventDefault();
        console.log("Question received!")
        if (!question) {
            alert("Enter a question first!");
            return;
        }
        setLoading(true);
        try {
            let result = await fetch('http://localhost:5000/llm', {
                method: "POST",
                body: JSON.stringify({ question }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            result = await result.json();
            setChatHistory([...chatHistory, { question: question, answer: result.response }]);
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
                    <div className='loading-dots'>
                        Loading Response
                        <span>.</span><span>.</span><span>.</span>
                    </div>
                )}
                <form className='chat-input-container'>
                    <input type="text" name="question" id="question" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Enter your question here" className='chat-input' />
                    <button className='send-button' onClick={handleQuestion}>Ask CricBot</button>
                </form>
            </div>
        </>
    );
};

export default LLM;
