import { useState, useEffect } from "react";
import { useWallet } from "../context/WalletContext";
import { WalletService } from "../services/walletService";

export const useBalance = (tokenAddress = null) => {
  const { kit, publicKey } = useWallet();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (publicKey) {
      fetchBalance();
    }
  }, [publicKey, tokenAddress]);

  const fetchBalance = async () => {
    setLoading(true);
    try {
      const service = new WalletService(kit, publicKey);
      const bal = tokenAddress
        ? await service.getTokenBalance(tokenAddress)
        : await service.getXLMBalance();
      setBalance(bal);
    } catch (error) {
      console.error("Failed to fetch balance:", error);
      setBalance(0);
    } finally {
      setLoading(false);
    }
  };

  return {
    balance,
    loading,
    refresh: fetchBalance,
  };
};
