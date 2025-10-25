import React from "react";
import { useWallet } from "../../context/WalletContext";
import { formatAddress } from "../../utils/formatting";
import Button from "../common/Button";

export default function WalletButton() {
  const { publicKey, isConnected, connectWallet, disconnectWallet, isLoading } =
    useWallet();

  if (isConnected && publicKey) {
    return (
      <div className="flex items-center space-x-2">
        <div className="bg-gray-100 px-4 py-2 rounded-lg">
          <span className="text-sm text-gray-600 font-mono">
            {formatAddress(publicKey)}
          </span>
        </div>
        <Button variant="danger" size="sm" onClick={disconnectWallet}>
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={connectWallet} loading={isLoading}>
      Connect Wallet
    </Button>
  );
}
