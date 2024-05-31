import { configureStore } from '@reduxjs/toolkit';
import chatReducer from '../features/chats/chatSlice';

export const store = configureStore({
  reducer: {
    chat: chatReducer,
  },
});
