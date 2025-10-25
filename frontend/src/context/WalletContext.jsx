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
    // Initialize wallet kit
    const walletKit = new StellarWalletsKit({
      network: WalletNetwork.TESTNET,
      selectedWalletId: FREIGHTER_ID,
      modules: [new FreighterModule(), new xBullModule()],
    });

    setKit(walletKit);

    // Check for saved connection
    const savedPublicKey = localStorage.getItem("walletPublicKey");
    if (savedPublicKey) {
      setPublicKey(savedPublicKey);
      setIsConnected(true);
    }
  }, []);

  const connectWallet = async () => {
    if (!kit) {
      toast.error("Wallet kit not initialized");
      return;
    }

    setIsLoading(true);
    try {
      await kit.openModal({
        onWalletSelected: async (option) => {
          try {
            kit.setWallet(option.id);
            const { address } = await kit.getAddress();

            setPublicKey(address);
            setIsConnected(true);
            localStorage.setItem("walletPublicKey", address);
            toast.success("Wallet connected successfully!");
          } catch (error) {
            console.error("Failed to get address:", error);
            toast.error("Failed to connect wallet");
          }
        },
      });
    } catch (error) {
      console.error("Wallet connection failed:", error);
      toast.error("Failed to connect wallet");
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

  const value = {
    kit,
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
