import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

const MessageItem = ({ message, isLast }) => {
  const userImage = "/assets/images/dani_4.png";
  const botImage = "/assets/images/itaca_logo_2.png";
  const [showSources, setShowSources] = useState(false);

  // Define styles for messages
  const messageStyles = {
    user: "bg-white text-black rounded",
    bot: "bg-cyan-600 text-white rounded",
  };

  // Function to format message text with bold sections
  const formatMessageText = (text) => {
    if (!text) {
      return null; // Or return an empty array if you prefer []
    }
    const parts = text.split("**").filter((part) => part !== "");
    return parts.map((part, index) =>
      index % 2 === 1 ? <strong key={index}>{part}</strong> : part,
    );
  };

  return (
    <div className={`flex flex-col ${isLast ? "flex-grow" : ""}`}>
      <div
        className={`flex items-center mb-4 ${
          message.type === "user" ? "flex-row-reverse" : ""
        }`}
      >
        <div className="rounded-full mr-4 h-10 relative overflow-hidden">
          <Image
            src={message.type === "user" ? userImage : botImage}
            alt={`${message.type}'s profile`}
            width={40}
            height={40}
            className="rounded"
            priority
            unoptimized
          />
        </div>
        <div
          className={`p-2 ${messageStyles[message.type]}`}
          style={{ maxWidth: "90%", whiteSpace: "pre-wrap" }}
        >
          {/* Render the formatted text */}
          {formatMessageText(message.text)}
        </div>
      </div>

      {message.sourceDocuments && (
        <div className="mb-6">
          <button
            className="text-gray-600 text-sm font-bold"
            onClick={() => setShowSources(!showSources)}
          >
            Source Documents {showSources ? "(Hide)" : "(Show)"}
          </button>
          {showSources &&
            message.sourceDocuments.map((document, docIndex) => (
              <div key={docIndex}>
                <a
                  href={document.metadata.PDFPath || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  <h3 className="text-gray-600 text-sm font-bold">
                    Link to Source {docIndex + 1}:
                  </h3>
                </a>
                <p className="text-gray-800 text-sm mt-2">
                  {document.pageContent}
                </p>
                <pre className="text-xs text-gray-500 mt-2">
                  {JSON.stringify(document.metadata, null, 2)}
                </pre>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

const ResultWithSources = ({ messages, maxMsgs }) => {
  const messagesContainerRef = useRef();

  useEffect(() => {
    if (messagesContainerRef.current) {
      const element = messagesContainerRef.current;
      element.scrollTop = element.scrollHeight;
    }
  }, [messages]);

  const maxMsgToScroll = maxMsgs || 5;

  return (
    <div
      ref={messagesContainerRef}
      className={`bg-white p-10 rounded-sm shadow-md mb-8 overflow-y-auto h-[500px] max-h-[500px] flex flex-col space-y-4 ${
        messages && messages.length < maxMsgToScroll ? "justify-end" : ""
      }`}
    >
      {messages &&
        messages.map((message, index) => (
          <MessageItem
            key={index}
            message={message}
            isLast={index === messages.length - 1}
          />
        ))}
    </div>
  );
};

export default ResultWithSources;
