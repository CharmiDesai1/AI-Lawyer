import React, { useState, useEffect } from "react";
import parse from 'html-react-parser';

const Document = () => {
  const [value, setValue] = useState(null);
  const [message, setMessage] = useState(null);
  const [previousChats, setPreviousChats] = useState([]);
  const [currentTitle, setCurrentTitle] = useState(null);

  const createNewChat = () => {
    setMessage(null);
    setValue("");
    setCurrentTitle(null);
  }

  const handleClick = (uniqueTitle) => {
    setCurrentTitle(uniqueTitle);
    setMessage(null);
    setValue("");
  }

  const getMessages = async () => {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: value
      })
    } 
    try {
      showloader();

      const response = await fetch("http://localhost:8001/getDocuments", options);
      const data = await response.json();
      const ans = data.choices[0].message.content;
      const role = data.choices[0].message.role;
      
      var showdown = require('showdown'),
      converter = new showdown.Converter(),
      html = converter.makeHtml(ans);
      
      if (html) {
        hideloader();
      }

      setMessage({ role: role, content: html });
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (!currentTitle && value && message) {
      setCurrentTitle(value);
    }
    if (currentTitle && value && message) {
      setPreviousChats(previousChats => ([
        ...previousChats,
        {
          title: currentTitle,
          role: "user",
          content: value
        },
        {
          title: currentTitle,
          role: message.role,
          content: message.content
        }
      ]));
    }
  }, [value, message, currentTitle]);

  const currentChat = previousChats.filter(previousChat => previousChat.title === currentTitle);
  const uniqueTitles = Array.from(new Set(previousChats.map(previousChat => previousChat.title)));

  function hideloader() {
    document.getElementById('loading').style.visibility = 'hidden';
  }

  function showloader() {
    document.getElementById('loading').style.visibility = 'visible';
  }

  return (
    <div className="app">
      <section className="side-bar">
        <button onClick={createNewChat}>+ New chat</button>
        <ul className="history">
          {uniqueTitles?.map((uniqueTitle, index) => <li key={index} onClick={() => handleClick(uniqueTitle)}>{uniqueTitle}</li>)}
        </ul>
        <nav>
          <p>Happy searching</p>
        </nav>
      </section>

      <section className="main">
        {!currentTitle && <h1>LegalMind for Documents</h1>}
        <ul className="feed">
          {currentChat?.map((chatMessage, index) => (
            <li key={index}>
              <p className="role">{chatMessage.role}</p>
              <p>{parse(chatMessage.content)}</p>
            </li>
          ))}
        </ul>

        <div className="d-flex justify-content-center">
          <div className="spinner-border" role="status">
            <span className="sr-only" id="loading"></span>
          </div>
        </div>

        <div className="bottom-container">
          <div className="input-container">
            <input value={value} onChange={(e) => setValue(e.target.value)} />
            <div id="submit" onClick={getMessages}>&#10146;</div>
          </div>
          <p className="info">
            Free Research Preview. ChatGPT may produce inaccurate information about people, places, or facts. ChatGPT May 24 Version
          </p>
        </div>
      </section>
    </div>
  );
}

export default Document;
