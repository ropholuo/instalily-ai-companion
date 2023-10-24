import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const api_key = "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";

  const [messages, setMessages] = useState([
    { role: "system", content: "Hello! How can I assist you today?" },
  ]);
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (event: any) => {
    setInputValue(event.target.value);
  };

  const handleSendClick = () => {
    if (inputValue.trim() !== "") {
      const newUserMessage = { role: "user", content: inputValue };

      // Update the messages state with the new user message
      setMessages((prevMessages) => [...prevMessages, newUserMessage]);

      setInputValue("");

      // Create a new array that includes the new user message
      const newMessages = [...messages, newUserMessage];
      // Pass the new array to the chatWithGPT function
      chatWithGPT(newMessages).then((botResponse) => {
        setMessages((prevMessages) => [
          ...prevMessages,
          { role: "assistant", content: botResponse },
        ]);
      });
    }
  };

  async function chatWithGPT(newMessages: { role: string; content: string }[]) {
    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          messages: newMessages,
          model: "gpt-4",
        },
        {
          headers: {
            Authorization: "Bearer " + api_key,
          },
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error("Error:", error);
    }
  }

  return (
    <div className="chatbot-sidepanel">
      <div className="chatbot-header">
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQpiQS82rEAFnfmsGWPvdl2kJF0beS-npGmGpNBb_cwTmpv_ureBvpwq5bvm1RXmq8XQ&usqp=CAU"
          alt="Instalily Logo"
          id="chatbot-logo"
        />
        <h2>Instalily AI Companion</h2>
        <h3>Made with love by Javion</h3>
      </div>
      <div className="chatbot-body">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`chatbot-message ${
              message.role === "user" ? "chatbot-message-right" : ""
            }`}
          >
            <p>{message.content}</p>
          </div>
        ))}
      </div>
      <div className="chatbot-footer">
        <input
          type="text"
          placeholder="Type your message here..."
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleSendClick();
            }
          }}
        />
        <button onClick={handleSendClick}>Send</button>
      </div>
    </div>
  );
}

export default App;
