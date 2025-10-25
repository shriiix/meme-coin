import React, { createContext, useContext, useState, useEffect } from "react";
import { useWallet } from "./WalletContext";

const TokenContext = createContext();

export const useTokens = () => {
  const context = useContext(TokenContext);
  if (!context) {
    throw new Error("useTokens must be used within TokenProvider");
  }
  return context;
};

export const TokenProvider = ({ children }) => {
  const { isConnected } = useWallet();
  const [tokens, setTokens] = useState([]);
  const [userTokens, setUserTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshTokens = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const addToken = (token) => {
    setTokens((prev) => [token, ...prev]);
  };

  const value = {
    tokens,
    userTokens,
    loading,
    setTokens,
    setUserTokens,
    setLoading,
    refreshTokens,
    addToken,
    refreshTrigger,
  };

  return (
    <TokenContext.Provider value={value}>{children}</TokenContext.Provider>
  );
};
