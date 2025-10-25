import React, { useEffect, useState } from "react";
import { useWallet } from "../../context/WalletContext";
import { WalletService } from "../../services/walletService";
import { formatCurrency } from "../../utils/formatting";
import Card from "../common/Card";
import Loader from "../common/Loader";

export default function UserPortfolio() {
  const { kit, publicKey } = useWallet();
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (kit && publicKey) {
      loadBalances();
    }
  }, [kit, publicKey]);

  const loadBalances = async () => {
    setLoading(true);
    try {
      const service = new WalletService(kit, publicKey);
      const allBalances = await service.getAllBalances();
      setBalances(allBalances);
    } catch (error) {
      console.error("Failed to load balances:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader text="Loading portfolio..." />;
  }

  if (balances.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-block p-6 bg-gray-100 rounded-full mb-4">
          <span className="text-6xl">💼</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          Empty Portfolio
        </h3>
        <p className="text-gray-600">Start trading to build your portfolio!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {balances.map((balance, index) => (
        <Card key={index}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-400 rounded-full flex items-center justify-center text-xl">
                {balance.asset.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  {balance.asset}
                </h3>
                {balance.issuer && (
                  <p className="text-xs text-gray-500 font-mono">
                    {balance.issuer.substring(0, 8)}...
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-800">
                {formatCurrency(balance.balance, "")}
              </p>
              <p className="text-sm text-gray-600">{balance.asset}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
