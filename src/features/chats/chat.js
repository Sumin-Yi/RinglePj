import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { sendMessage } from './chatSlice';
import Message from './message';
import axios from 'axios';
import { arrayBufferToBase64 } from './utils';

const Chat = () => {
  const [input, setInput] = useState('');
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const messages = useSelector((state) => state.chat.messages);
  const dispatch = useDispatch();

  useEffect(() => {
    const handleVoiceOutput = async (message) => {
      if (message.sender === 'ai') {
        try {
          const response = await axios.post(
            `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.REACT_APP_GOOGLE_CLOUD_API_KEY}`,
            {
              input: { text: message.text },
              voice: { languageCode: 'ko-KR', ssmlGender: 'NEUTRAL' },
              audioConfig: { audioEncoding: 'MP3' },
            }
          );

          const audioContent = response.data.audioContent;
          const audio = new Audio('data:audio/mp3;base64,' + audioContent);
          audio.play();
        } catch (error) {
          console.error('Error with voice output:', error);
        }
      }
    };

    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      handleVoiceOutput(lastMessage);
    }
  }, [messages]);

  const handleSend = (text) => {
    if (text.trim()) {
      dispatch(sendMessage(text));
    }
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      setAudioChunks([]);

      recorder.ondataavailable = (event) => {
        setAudioChunks((prev) => [...prev, event.data]);
      };

      recorder.start();
      setRecording(true);
    } catch (error) {
      console.error('Error with voice input:', error);
    }
  };

  const handleStopRecording = async () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks);
        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioBase64 = arrayBufferToBase64(arrayBuffer);

        const response = await axios.post(
          `https://speech.googleapis.com/v1/speech:recognize?key=${process.env.GOOGLE_API_KEY}`,
          {
            config: {
              encoding: 'LINEAR16',
              sampleRateHertz: 16000,
              languageCode: 'ko-KR',
            },
            audio: {
              content: audioBase64,
            },
          }
        );

        const transcript = response.data.results
          .map((result) => result.alternatives[0].transcript)
          .join('\n');

        handleSend(transcript);
        setInput(transcript);
      };
      setRecording(false);
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
      <button onClick={() => handleSend(input)}>Send</button>
      <button onClick={handleStartRecording} disabled={recording}>
        {recording ? 'Recording...' : 'Start Recording'}
      </button>
      <button onClick={handleStopRecording} disabled={!recording}>
        Stop Recording
      </button>
    </div>
  );
};

export default Chat;
