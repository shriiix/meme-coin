import { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { DEXService } from "../services/dexService";
import toast from "react-hot-toast";

export const useTrade = () => {
  const { kit, publicKey } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createSellOrder = async (tokenAddress, amount, price) => {
    setLoading(true);
    setError(null);
    try {
      const service = new DEXService(kit, publicKey);
      const result = await service.createSellOrder(tokenAddress, amount, price);
      toast.success("Sell order created successfully!");
      return result;
    } catch (err) {
      console.error("Failed to create sell order:", err);
      setError(err.message);
      toast.error("Failed to create sell order");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const buyTokens = async (orderId) => {
    setLoading(true);
    setError(null);
    try {
      const service = new DEXService(kit, publicKey);
      const result = await service.buyTokens(orderId);
      toast.success("Tokens purchased successfully!");
      return result;
    } catch (err) {
      console.error("Failed to buy tokens:", err);
      setError(err.message);
      toast.error("Failed to buy tokens");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createSellOrder,
    buyTokens,
  };
};
