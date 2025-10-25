import { useState, useEffect } from "react";
import { useWallet } from "../context/WalletContext";
import { createHorizonServer } from "../utils/stellar";

export const useStellarWallet = () => {
  const { publicKey, isConnected } = useWallet();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (publicKey && isConnected) {
      fetchBalance();
    }
  }, [publicKey, isConnected]);

  const fetchBalance = async () => {
    if (!publicKey) return;

    setLoading(true);
    try {
      const server = createHorizonServer();
      const account = await server.loadAccount(publicKey);
      const xlmBalance = account.balances.find(
        (b) => b.asset_type === "native"
      );
      setBalance(xlmBalance ? parseFloat(xlmBalance.balance) : 0);
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
    refreshBalance: fetchBalance,
  };
};
