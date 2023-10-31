import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./App.css";
import api_key from "./apikey";

function App() {
  const urlRegex =
    /(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])/g;
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! How can I assist you today?" },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [systemContent, setSystemContent] = useState<
    { role: string; content: string }[]
  >([]);
  const historyPages = useRef<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (event: any) => {
    setInputValue(event.target.value);
  };

  useEffect(() => {
    chrome.runtime.onMessage.addListener(({ name, data, url }) => {
      if (name === "web-content") {
        if (historyPages.current.includes(url)) {
          return;
        }
        const urlAndContent = `${url} - ${data}`;
        setSystemContent((prevMessages) => [
          ...prevMessages,
          { role: "system", content: urlAndContent },
        ]);
        summarizeWebPage(data).then((summary) => {
          const summarizedContent = `${url} - ${summary}`;
          // Update the systemContent with the same url but with the summary
          setSystemContent((prevMessages) =>
            prevMessages.map((message) => {
              if (message.content.startsWith(url)) {
                return { ...message, content: summarizedContent };
              }
              return message;
            })
          );
        });
        historyPages.current.push(url);
      }
    });
  });

  const handleSendClick = () => {
    if (inputValue.trim() !== "") {
      const newUserMessage = { role: "user", content: inputValue };

      // Update the messages state with the new user message
      setMessages((prevMessages) => [...prevMessages, newUserMessage]);

      setInputValue("");

      // Create a new array that includes the new user message
      const newMessages = [...systemContent, ...messages, newUserMessage];
      console.log(newMessages);
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
    setIsLoading(true);
    try {
      const response = await axios
        .post(
          "https://api.openai.com/v1/chat/completions",
          {
            messages: newMessages,
            model: "gpt-4",
          },
          {
            headers: {
              Authorization: "Bearer " + api_key,
              "Content-Type": "application/json",
            },
          }
        )
        .finally(() => {
          setIsLoading(false);
        });
      console.log(response);
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error("Error:", error);
    }
  }

  async function summarizeWebPage(content: string) {
    const prompt = `Please summarize the most important or critical information from the following webpage in a concise manner, using less than 200 words.: ${content}`;
    return chatWithGPT([{ role: "user", content: prompt }]);
  }

  function formatMessageContent(content: string) {
    return content.replace(urlRegex, (url) => {
      console.log(url);
      const absoluteUrl = url.startsWith("http") ? url : `http://${url}`;
      return `<a href="${absoluteUrl}" target="_blank">${url}</a>`;
    });
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
            <p
              dangerouslySetInnerHTML={{
                __html: formatMessageContent(message.content),
              }}
            ></p>
          </div>
        ))}
        {isLoading && <div className="loading"></div>}
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
