import React from 'react';

const Message = ({ message }) => {
  return (
    <div className={message.sender === 'user' ? 'user-message' : 'ai-message'}>
      <p>{message.text}</p>
    </div>
  );
};

export default Message;
