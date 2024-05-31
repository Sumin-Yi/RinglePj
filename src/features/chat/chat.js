import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { sendMessage } from './chatSlice';
import Message from './message';

const Chat = () => {
  const [input, setInput] = useState('');
  const messages = useSelector((state) => state.chat.messages);
  const dispatch = useDispatch();

  const handleSend = () => {
    if (input.trim()) {
      dispatch(sendMessage(input));
      setInput('');
    }
  };

  return (
    <div>
      <div>
        {messages.map((message, index) => (
          <Message key={index} message={message} />
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message..."
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
};

export default Chat;
