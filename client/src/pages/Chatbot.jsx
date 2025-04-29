import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { FaPaperPlane, FaRobot, FaUser } from 'react-icons/fa';
import './Chatbot.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/api/chatbot/chat', {
        message: userMessage
      });

      setMessages(prev => [...prev, { 
        text: response.data.response, 
        sender: 'bot',
        drugData: response.data.drugData 
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        text: 'Sorry, I encountered an error. Please try again.', 
        sender: 'bot' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h1>MediBot Assistant</h1>
        <p>Ask me anything about medications or general health questions</p>
      </div>

      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender}`}>
            <div className="message-icon">
              {message.sender === 'user' ? <FaUser /> : <FaRobot />}
            </div>
            <div className="message-content">
              <p>{message.text}</p>
              {message.drugData && (
                <div className="drug-details">
                  <h4>Drug Information:</h4>
                  <pre>{JSON.stringify(message.drugData, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="message bot">
            <div className="message-icon">
              <FaRobot />
            </div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="chat-input">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your message here..."
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
};

export default Chatbot; 