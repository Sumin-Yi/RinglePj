import React from 'react';

const Message = ({ message }) => {
  return (
    <div>
      <strong>{message.sender === 'user' ? 'You' : 'AI'}:</strong> {message.text}
    </div>
  );
};

export default Message;
