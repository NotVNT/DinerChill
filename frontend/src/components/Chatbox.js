import React, { useState, useRef, useEffect } from "react";
import "../styles/components/chatbox.css";

const Chatbox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Xin chào! Tôi là DinerChill AI, trợ lý đặt bàn thông minh. Bạn cần tìm nhà hàng hay đặt bàn? 😊",
      sender: "bot",
      timestamp: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Create a persistent sessionId when component mounts
  useEffect(() => {
    // Get existing sessionId or create a new one
    const existingSessionId = localStorage.getItem('chatSessionId');
    if (existingSessionId) {
      setSessionId(existingSessionId);
    } else {
      const newSessionId = `session_${Date.now()}`;
      localStorage.setItem('chatSessionId', newSessionId);
      setSessionId(newSessionId);
    }
  }, []);

  const toggleChatbox = () => {
    setIsOpen(!isOpen);
  };

  const getBotResponse = async (message) => {
    if (!sessionId) return { message: "Đang khởi tạo phiên chat, vui lòng thử lại." };
    
    try {
      // Extract conversation history to provide context
      const conversationHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'bot',
        content: msg.text
      }));
      
      const response = await fetch('/api/chatbox/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          userId: localStorage.getItem('userId') || 'anonymous',
          sessionId: sessionId,
          conversationHistory: conversationHistory
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isTyping) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: "user",
      timestamp: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage("");
    setIsTyping(true);

    try {
      const response = await getBotResponse(inputMessage);

      const botMessage = {
        id: newMessages.length + 1,
        text: response.message,
        sender: "bot",
        timestamp: new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = {
        id: newMessages.length + 1,
        text: "Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau.",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickReplies = [
    { text: "Nhà hàng lẩu", icon: "🍲" },
    { text: "Nhà hàng buffet", icon: "🍽️" },
    { text: "Bàn trống hôm nay", icon: "📋" },
    { text: "Khuyến mãi", icon: "🎁" },
    { text: "Đặt bàn", icon: "ℹ️" },
    { text: "Tiện ích nhà hàng", icon: "✨" },
  ];

  const handleQuickReply = (reply) => {
    setInputMessage(reply);
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <div
        className={`chat-toggle ${isOpen ? "open" : ""}`}
        onClick={toggleChatbox}
      >
        {isOpen ? (
          <i className="close-icon">✕</i>
        ) : (
          <div className="chat-icon">
            <i className="message-icon">💬</i>
            <div className="notification-dot"></div>
          </div>
        )}
      </div>

      {/* Chatbox */}
      <div className={`chatbox ${isOpen ? "open" : ""}`}>
        <div className="chatbox-header">
          <div className="bot-info">
            <div className="bot-avatar">🤖</div>
            <div className="bot-details">
              <h4>DinerChill AI</h4>
              <span>Trợ lý tư vấn nhà hàng</span>
            </div>
          </div>
          <div className="chat-controls">
            <button 
              className="reset-chat" 
              title="Đặt lại cuộc trò chuyện"
              onClick={() => {
                const newSessionId = `session_${Date.now()}`;
                localStorage.setItem('chatSessionId', newSessionId);
                setSessionId(newSessionId);
                setMessages([{
                  id: 1,
                  text: "Xin chào! Tôi là DinerChill AI, trợ lý đặt bàn thông minh. Bạn cần tìm nhà hàng hay đặt bàn? 😊",
                  sender: "bot",
                  timestamp: new Date().toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                }]);
              }}
            >
              🔄
            </button>
            <button className="close-chat" onClick={toggleChatbox}>
              ✕
            </button>
          </div>
        </div>

        <div className="chatbox-messages">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.sender}`}>
              {message.sender === "bot" && (
                <div className="message-avatar">🤖</div>
              )}
              <div className="message-content">
                <div className="message-text">{message.text}</div>
                <div className="message-time">{message.timestamp}</div>
              </div>
              {message.sender === "user" && (
                <div className="message-avatar">👤</div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="message bot">
              <div className="message-avatar">🤖</div>
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

        <div className={`quick-replies ${showQuickReplies ? 'visible' : 'hidden'}`}>
          <div className="quick-replies-header">
            <div className="quick-replies-title">Gợi ý nhanh:</div>
            <button 
              className="toggle-suggestions-btn"
              onClick={() => setShowQuickReplies(!showQuickReplies)}
              title={showQuickReplies ? "Ẩn gợi ý" : "Hiện gợi ý"}
            >
              {showQuickReplies ? "−" : "+"}
            </button>
          </div>
          {showQuickReplies && (
            <div className="quick-replies-grid">
              {quickReplies.map((reply, index) => (
                <button
                  key={index}
                  className="quick-reply-btn"
                  onClick={() => handleQuickReply(reply.text)}
                >
                  <span className="quick-reply-icon">{reply.icon}</span>
                  <span className="quick-reply-text">{reply.text}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <form className="chatbox-input" onSubmit={handleSendMessage}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Nhập tin nhắn..."
            disabled={isTyping}
          />
          <button type="submit" disabled={isTyping || !inputMessage.trim()}>
            <i className="send-icon">➤</i>
          </button>
        </form>
      </div>
    </>
  );
};

export default Chatbox;
