import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// This is the initial message content taken from your screenshot.

/**
 * A helper function to parse markdown-style bold text (**text**) and convert it to HTML.
 * @param {string} text - The text to format.
 * @returns {object} - An object for dangerouslySetInnerHTML.
 */
const formatMessage = (text) => {
  const formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  return { __html: formattedText };
};


const ChatPage = () => {
  // State to hold the list of messages
  const initialMessage = "Hello! How can I help you today?";
  const [messages, setMessages] = useState([
    { id: 1, text: initialMessage, sender: 'ai' }
  ]);
  
  // State for the controlled input component
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Ref to the end of the messages list for auto-scrolling
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Effect to scroll to the bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => { // Make it async
    e.preventDefault();
    if (inputValue.trim() === '') return;

    const newMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user'
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]); // Use functional update
    setInputValue('');
    setIsLoading(true); // Set loading state

    try {
      const response = await axios.post('http://localhost:5000/api/ai/chat', {
        message: newMessage.text,
        history: messages.map(msg => ({ role: msg.sender === 'ai' ? 'model' : 'user', content: msg.text }))
      });

      const aiReply = {
        id: messages.length + 2,
        text: response.data.reply,
        sender: 'ai'
      };

      setMessages((prevMessages) => [...prevMessages, aiReply]); // Add AI reply
    } catch (error) {
      console.error("Error sending message to AI:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { id: prevMessages.length + 1, text: "Error: Could not get a response from AI.", sender: "ai" }
      ]);
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  return (
    <div style={styles.chatContainer}>
      <header style={styles.header}>
        <h2 style={styles.title}>AI CHAT</h2>
        <h5 style={styles.title}>Hello, There! What can I help you with?</h5>
      </header>
      
      <div style={styles.messagesContainer}>
        {messages.map((message) => (
          <div
            key={message.id}
            style={message.sender === 'user' ? styles.userMessage : styles.aiMessage}
          >
            {/* Using dangerouslySetInnerHTML is okay here because we are controlling the content.
              Be very cautious with this if rendering user-generated content from a database
              to prevent XSS (Cross-Site Scripting) attacks.
            */}
            <p dangerouslySetInnerHTML={formatMessage(message.text)}></p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} style={styles.inputForm}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type a message..."
          style={styles.input}
          disabled={isLoading} // Disable when loading
        />
        <button type="submit" style={styles.sendButton} disabled={isLoading}>Send</button>
      </form>
    </div>
  );
};


// CSS styles to mimic the screenshot
const styles = {
  chatContainer: {
    fontFamily: 'sans-serif',
    maxWidth: '800px',
    margin: '40px auto',
    border: '1px solid #ddd',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    height: '80vh',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  header: {
    padding: '10px 20px',
    borderBottom: '1px solid #ddd',
  },
  title: {
    margin: '0 0 5px 0',
  },
  subtitle: {
    margin: 0,
    fontSize: '0.9em',
    color: '#555',
  },
  messagesContainer: {
    flex: 1,
    padding: '20px',
    backgroundColor: '#f0fff0', // Light green background
    overflowY: 'auto',
    lineHeight: '1.6',
    display: 'flex',
    flexDirection: 'column',
  },
  message: {
    marginBottom: '10px',
    whiteSpace: 'pre-wrap', // Preserves line breaks and spacing
  },
  userMessage: {
    backgroundColor: '#e0f7fa', // Light blue for user
    padding: '8px 12px',
    borderRadius: '10px',
    alignSelf: 'flex-end', // Align to the right
    maxWidth: '70%',
    marginBottom: '10px',
    whiteSpace: 'pre-wrap',
  },
  aiMessage: {
    backgroundColor: '#f0f0f0', // Light gray for AI
    padding: '8px 12px',
    borderRadius: '10px',
    alignSelf: 'flex-start', // Align to the left
    maxWidth: '70%',
    marginBottom: '10px',
    whiteSpace: 'pre-wrap',
  },
  inputForm: {
    display: 'flex',
    padding: '10px',
    borderTop: '1px solid #ddd',
  },
  input: {
    flex: 1,
    padding: '10px',
    fontSize: '1em',
    border: '1px solid #ccc',
    borderRadius: '4px',
    marginRight: '10px',
  },
  sendButton: {
    padding: '10px 20px',
    fontSize: '1em',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: '#f0f0f0',
  },
};

export default ChatPage;