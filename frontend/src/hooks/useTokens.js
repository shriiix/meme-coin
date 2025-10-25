import { useState, useEffect } from "react";
import { useTokens as useTokensContext } from "../context/TokenContext";
import { useWallet } from "../context/WalletContext";
import { TokenFactoryService } from "../services/tokenFactory";

export const useTokens = () => {
  const { tokens, setTokens, setLoading, refreshTrigger } = useTokensContext();
  const { kit, publicKey } = useWallet();
  const [error, setError] = useState(null);

  useEffect(() => {
    if (kit && publicKey) {
      loadTokens();
    }
  }, [kit, publicKey, refreshTrigger]);

  const loadTokens = async () => {
    setLoading(true);
    setError(null);
    try {
      const service = new TokenFactoryService(kit, publicKey);
      const allTokens = await service.getAllTokens();
      setTokens(allTokens);
    } catch (err) {
      console.error("Failed to load tokens:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    tokens,
    error,
    reload: loadTokens,
  };
};
