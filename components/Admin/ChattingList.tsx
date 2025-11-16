"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/utils/store/store";
import { getChattingDrivers, getChattingMessages, sendChatMessage } from "@/utils/reducers/adminReducers";
import { setSearchQuery, setSelectedDriver, addMessage } from "@/utils/slices/chattingSlice";

export default function ChattingList() {
  const dispatch = useAppDispatch();
  const { drivers, selectedDriver, messages, isLoading, error, searchQuery, sendingMessage } =
    useAppSelector((s) => s.chatting);
  const [messageInput, setMessageInput] = useState("");

  useEffect(() => {
    dispatch(getChattingDrivers({})).catch(() => {});
  }, [dispatch]);

  useEffect(() => {
    if (selectedDriver) {
      dispatch(getChattingMessages(String(selectedDriver.id))).catch(() => {});
    }
  }, [dispatch, selectedDriver]);

  const filteredDrivers = useMemo(() => {
    if (!searchQuery) return drivers;
    const q = searchQuery.toLowerCase();
    return drivers.filter((driver) => driver.name.toLowerCase().includes(q));
  }, [drivers, searchQuery]);

  const handleDriverSelect = (driver: any) => {
    dispatch(setSelectedDriver(driver));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedDriver || sendingMessage) return;

    try {
      const result = await dispatch(
        sendChatMessage({
          driverId: String(selectedDriver.id),
          message: messageInput.trim(),
        })
      );
      if ((result as any).meta.requestStatus === "fulfilled") {
        setMessageInput("");
        dispatch(addMessage((result as any).payload));
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes} ${ampm}`;
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-teal-500 rounded-xl p-6 flex items-center space-x-3">
        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <h2 className="text-2xl font-bold text-white">Chatting List</h2>
      </div>

      {/* Main Content - Two Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Driver List */}
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              placeholder="Search driver"
              className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-teal-500 outline-none"
            />
            <svg
              className="h-5 w-5 text-gray-400 absolute left-3 top-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
            </svg>
          </div>

          {/* Drivers Heading */}
          <h3 className="text-lg font-bold text-gray-900">Drivers</h3>

          {/* Driver List or Placeholder */}
          {error && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
              Unable to load drivers. Displaying placeholder. Ensure backend endpoints are implemented.
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading drivers...</p>
            </div>
          ) : filteredDrivers.length > 0 ? (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredDrivers.map((driver) => (
                <button
                  key={driver.id}
                  onClick={() => handleDriverSelect(driver)}
                  className={`w-full p-3 rounded-lg transition-colors text-left ${
                    selectedDriver?.id === driver.id
                      ? "bg-teal-50 border-2 border-teal-500"
                      : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      {driver.profileImage ? (
                        <img
                          src={driver.profileImage}
                          alt={driver.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                          <span className="text-teal-600 font-bold text-lg">
                            {driver.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      {driver.status === "online" && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{driver.name}</div>
                      {driver.lastMessage && (
                        <div className="text-sm text-gray-500 truncate">{driver.lastMessage}</div>
                      )}
                    </div>
                    {driver.unreadCount && driver.unreadCount > 0 && (
                      <div className="bg-teal-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                        {driver.unreadCount}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <div className="relative mb-6">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center border-4 border-white">
                  <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-lg font-semibold text-gray-600 mb-1">No driver found</p>
              <p className="text-sm text-gray-400">Try adjusting your search query</p>
            </div>
          )}
        </div>

        {/* Right Panel - Chat Window */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg flex flex-col">
          {selectedDriver ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-teal-50 to-teal-100 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {selectedDriver.profileImage ? (
                      <img
                        src={selectedDriver.profileImage}
                        alt={selectedDriver.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center border-2 border-white shadow-md">
                        <span className="text-white font-bold text-lg">
                          {selectedDriver.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-gray-900 text-lg">{selectedDriver.name}</div>
                      {selectedDriver.status && (
                        <div className="text-xs text-gray-600 mt-0.5">
                          {selectedDriver.status === "online" ? (
                            <span className="flex items-center">
                              <span className="w-2.5 h-2.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                              <span className="text-green-600 font-medium">Online</span>
                            </span>
                          ) : (
                            <span className="text-gray-500">Offline</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <button className="p-2.5 text-gray-500 hover:text-teal-600 hover:bg-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white">
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600 mx-auto"></div>
                    <p className="text-gray-500 mt-3 font-medium">Loading messages...</p>
                  </div>
                ) : messages.length > 0 ? (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderType === "admin" ? "justify-end" : "justify-start"} animate-fade-in`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                          message.senderType === "admin"
                            ? "bg-gradient-to-br from-teal-600 to-teal-700 text-white"
                            : "bg-white text-gray-900 border border-gray-200 shadow"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{message.message}</p>
                        <p
                          className={`text-xs mt-1.5 ${
                            message.senderType === "admin" ? "text-teal-100" : "text-gray-500"
                          }`}
                        >
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-50 mb-4">
                      <svg className="w-8 h-8 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-600 font-medium mb-1">No messages yet</p>
                    <p className="text-sm text-gray-400">Start the conversation by sending a message below</p>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white rounded-b-xl shadow-inner">
                <div className="flex items-center space-x-3">
                  <div className="flex-1 relative">
                    <input
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Type a message..."
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all bg-gray-50 focus:bg-white"
                      disabled={sendingMessage}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!messageInput.trim() || sendingMessage}
                    className="px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl hover:from-teal-700 hover:to-teal-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center space-x-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 disabled:transform-none"
                  >
                    {sendingMessage ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                          />
                        </svg>
                        <span>Send</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="relative flex flex-col items-center justify-center h-full py-20 text-gray-400">
              <div className="relative mb-8">
                <div className="w-40 h-40 rounded-full bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center shadow-inner">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-200 to-teal-300 flex items-center justify-center">
                      <svg className="w-12 h-12 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-white rounded-full flex items-center justify-center border-2 border-teal-200 shadow-md">
                      <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xl font-semibold text-gray-600 mb-2">Select a driver from list</p>
              <p className="text-sm text-gray-400 max-w-xs text-center">Choose a driver from the left panel to start a conversation</p>
              <button className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 py-2">
        support@gauvaservices.in
      </div>
    </div>
  );
}

