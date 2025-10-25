import React, { createContext, useContext, useState, useEffect } from "react";
import {
  StellarWalletsKit,
  WalletNetwork,
  FREIGHTER_ID,
  FreighterModule,
  xBullModule,
} from "@creit.tech/stellar-wallets-kit";
import toast from "react-hot-toast";

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const [kit, setKit] = useState(null);
  const [publicKey, setPublicKey] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const walletKit = new StellarWalletsKit({
      network: WalletNetwork.TESTNET,
      selectedWalletId: FREIGHTER_ID,
      modules: [new FreighterModule(), new xBullModule()],
    });
    setKit(walletKit);

    const savedPublicKey = localStorage.getItem("walletPublicKey");
    if (savedPublicKey) {
      setPublicKey(savedPublicKey);
      setIsConnected(true);
    }
  }, []);

  const connectWallet = async () => {
    setIsLoading(true);
    try {
      await kit.openModal({
        onWalletSelected: async (option) => {
          kit.setWallet(option.id);
          const { address } = await kit.getAddress();
          setPublicKey(address);
          setIsConnected(true);
          localStorage.setItem("walletPublicKey", address);
          toast.success("Wallet connected successfully!");
        },
      });
    } catch (error) {
      console.error("Wallet connection failed:", error);
      toast.error("Failed to connect wallet. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setPublicKey(null);
    setIsConnected(false);
    localStorage.removeItem("walletPublicKey");
    toast.success("Wallet disconnected");
  };

  // Custom sign method that works with the kit
  const signTransaction = async (xdr, options) => {
    try {
      const result = await kit.sign(xdr, options);
      return result;
    } catch (error) {
      console.error("Sign failed:", error);
      throw error;
    }
  };

  const value = {
    kit: {
      ...kit,
      sign: signTransaction,
    },
    publicKey,
    isConnected,
    isLoading,
    connectWallet,
    disconnectWallet,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};
