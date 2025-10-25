import { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { StellarService } from "../services/stellarService";
import toast from "react-hot-toast";

export const useContract = () => {
  const { kit, publicKey } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const invokeContract = async (contractId, method, params) => {
    setLoading(true);
    setError(null);
    try {
      const service = new StellarService(kit, publicKey);
      const result = await service.invokeContract(contractId, method, params);
      return result;
    } catch (err) {
      console.error("Contract invocation failed:", err);
      setError(err.message);
      toast.error("Transaction failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    invokeContract,
  };
};
