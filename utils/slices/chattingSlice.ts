import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getChattingDrivers, getChattingMessages, sendChatMessage } from "../reducers/adminReducers";

export interface Driver {
  id: string | number;
  name: string;
  profileImage?: string;
  status?: "online" | "offline";
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

export interface ChatMessage {
  id: string | number;
  driverId: string | number;
  senderId: string | number;
  senderType: "admin" | "driver";
  message: string;
  timestamp: string;
  read: boolean;
}

interface ChattingState {
  drivers: Driver[];
  selectedDriver: Driver | null;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  sendingMessage: boolean;
}

const initialState: ChattingState = {
  drivers: [],
  selectedDriver: null,
  messages: [],
  isLoading: false,
  error: null,
  searchQuery: "",
  sendingMessage: false,
};

const chattingSlice = createSlice({
  name: "chatting",
  initialState,
  reducers: {
    clearChattingError: (state) => {
      state.error = null;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSelectedDriver: (state, action: PayloadAction<Driver | null>) => {
      state.selectedDriver = action.payload;
      state.messages = [];
    },
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getChattingDrivers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getChattingDrivers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.drivers = action.payload || [];
      })
      .addCase(getChattingDrivers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(getChattingMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getChattingMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload || [];
      })
      .addCase(getChattingMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(sendChatMessage.pending, (state) => {
        state.sendingMessage = true;
        state.error = null;
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.sendingMessage = false;
        if (action.payload) {
          state.messages.push(action.payload);
        }
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.sendingMessage = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearChattingError, setSearchQuery, setSelectedDriver, addMessage } = chattingSlice.actions;
export default chattingSlice.reducer;

