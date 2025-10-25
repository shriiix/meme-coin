import React, { createContext, useContext, useState, useEffect } from "react";
import { useWallet } from "./WalletContext";
import { TokenFactoryService } from "../services/tokenFactory";

const TokenContext = createContext();

export const useTokens = () => {
  const context = useContext(TokenContext);
  if (!context) {
    throw new Error("useTokens must be used within TokenProvider");
  }
  return context;
};

export const TokenProvider = ({ children }) => {
  const { kit, publicKey, isConnected } = useWallet();
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch tokens when wallet connects
  useEffect(() => {
    if (isConnected && publicKey && kit) {
      fetchTokens();
    } else {
      setTokens([]);
    }
  }, [isConnected, publicKey, kit]);

  const fetchTokens = async () => {
    if (!kit || !publicKey) {
      console.log("⚠️ Cannot fetch tokens: wallet not connected");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("🔄 Fetching tokens...");
      const service = new TokenFactoryService(kit, publicKey);

      // Get all tokens
      const allTokens = await service.getAllTokens();
      console.log("✅ Fetched tokens:", allTokens);

      setTokens(allTokens || []);
    } catch (err) {
      console.error("❌ Failed to fetch tokens:", err);
      setError(err.message);
      setTokens([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshTokens = () => {
    console.log("🔄 Manual refresh triggered");
    fetchTokens();
  };

  const value = {
    tokens,
    loading,
    error,
    refreshTokens,
  };

  return (
    <TokenContext.Provider value={value}>{children}</TokenContext.Provider>
  );
};
