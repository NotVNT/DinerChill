import React, { useState, useRef, useEffect } from "react";
import "../styles/components/chatbox.css";
import chatService from "../services/chatService";

const Chatbox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Xin chào! Tôi là trợ lý AI của DinerChill. Tôi có thể giúp bạn tìm nhà hàng phù hợp, gợi ý món ăn, và hỗ trợ đặt bàn. Bạn cần tôi giúp gì không?",
      sender: "bot",
      timestamp: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleChatbox = () => {
    setIsOpen(!isOpen);
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
      // Use ChatService for response
      const response = await chatService.getBotResponse(inputMessage, messages);

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

      // Save conversation for analytics
      chatService.saveConversation([...newMessages, botMessage]);
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
    "Tìm nhà hàng lẩu",
    "Nhà hàng buffet",
    "Đặt bàn tiệc",
    "Nhà hàng gần tôi",
    "Hướng dẫn đặt bàn",
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
          <button className="close-chat" onClick={toggleChatbox}>
            ✕
          </button>
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

        <div className="quick-replies">
          {quickReplies.map((reply, index) => (
            <button
              key={index}
              className="quick-reply-btn"
              onClick={() => handleQuickReply(reply)}
            >
              {reply}
            </button>
          ))}
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
