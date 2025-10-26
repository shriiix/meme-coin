import { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { DEXService } from "../services/dexService";
import toast from "react-hot-toast";

export const useTrade = () => {
  const { kit, publicKey } = useWallet();
  const [loading, setLoading] = useState(false);

  const createSellOrder = async (tokenContractId, amount, pricePerToken) => {
    if (!kit || !publicKey) {
      throw new Error("Wallet not connected");
    }

    setLoading(true);
    const toastId = toast.loading("Creating sell order...");

    try {
      const service = new DEXService(kit, publicKey);

      // Convert to stroops (7 decimals for XLM)
      const amountInStroops = Math.floor(amount * Math.pow(10, 7));
      const priceInStroops = Math.floor(pricePerToken * Math.pow(10, 7));

      const result = await service.createSellOrder(
        tokenContractId,
        amountInStroops,
        priceInStroops
      );

      toast.success("Sell order created successfully! 🎉", { id: toastId });
      return result;
    } catch (error) {
      console.error("Create sell order failed:", error);
      toast.error(error.message || "Failed to create sell order", {
        id: toastId,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const buyTokens = async (orderId, amount) => {
    if (!kit || !publicKey) {
      throw new Error("Wallet not connected");
    }

    setLoading(true);
    const toastId = toast.loading("Buying tokens...");

    try {
      const service = new DEXService(kit, publicKey);

      // Convert to stroops
      const amountInStroops = Math.floor(amount * Math.pow(10, 7));

      const result = await service.buyTokens(orderId, amountInStroops);

      toast.success("Tokens purchased successfully! 🎉", { id: toastId });
      return result;
    } catch (error) {
      console.error("Buy tokens failed:", error);
      toast.error(error.message || "Failed to buy tokens", { id: toastId });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    if (!kit || !publicKey) {
      throw new Error("Wallet not connected");
    }

    setLoading(true);
    const toastId = toast.loading("Canceling order...");

    try {
      const service = new DEXService(kit, publicKey);
      const result = await service.cancelOrder(orderId);

      toast.success("Order canceled successfully!", { id: toastId });
      return result;
    } catch (error) {
      console.error("Cancel order failed:", error);
      toast.error(error.message || "Failed to cancel order", { id: toastId });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getTokenOrders = async (tokenContractId) => {
    if (!kit || !publicKey) {
      return [];
    }

    try {
      const service = new DEXService(kit, publicKey);
      const orders = await service.getTokenOrders(tokenContractId);
      return orders;
    } catch (error) {
      console.error("Failed to get token orders:", error);
      return [];
    }
  };

  return {
    createSellOrder,
    buyTokens,
    cancelOrder,
    getTokenOrders,
    loading,
  };
};
