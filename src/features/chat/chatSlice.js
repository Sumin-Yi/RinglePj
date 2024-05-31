import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const initialState = {
  messages: [],
  error: null,
  status: 'idle',
};

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (text, { rejectWithValue }) => {
    try {
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
        const errorData = await response.json();
        return rejectWithValue(errorData);
      }

      const data = await response.json();
      return { userMessage: text, aiMessage: data.choices[0].message.content.trim() };
    } catch (error) {
      return rejectWithValue(error.message);
    }
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
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.messages.push({ sender: 'user', text: action.payload.userMessage });
        state.messages.push({ sender: 'ai', text: action.payload.aiMessage });
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to fetch response from OpenAI API';
      });
  },
});

export const { addMessage } = chatSlice.actions;

export default chatSlice.reducer;
