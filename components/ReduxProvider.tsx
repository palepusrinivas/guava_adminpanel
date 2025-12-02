"use client";
import store from "@/utils/store/store";
import React, { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import { hydrateAuth } from "@/utils/slices/authSlice";

function ReduxProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Hydrate auth state from localStorage on client-side
    store.dispatch(hydrateAuth());
  }, []);

  return (
    <Provider store={store}>
      <Toaster />
      {children}
    </Provider>
  );
}

export default ReduxProvider;
