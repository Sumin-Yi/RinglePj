import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const initialState = {
  messages: [],
  status: 'idle',
};

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (text) => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: text }],
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch response from OpenAI API');
    }

    const data = await response.json();
    return { userMessage: text, aiMessage: data.choices[0].message.content.trim() };
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push({ sender: 'user', text: action.payload.userMessage });
        state.messages.push({ sender: 'ai', text: action.payload.aiMessage });
        state.status = 'idle';
      })
      .addCase(sendMessage.rejected, (state) => {
        state.status = 'idle';
      });
  },
});

export const { addMessage } = chatSlice.actions;

export default chatSlice.reducer;
