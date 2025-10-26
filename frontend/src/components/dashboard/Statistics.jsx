import React from "react";
import { useTokens } from "../../context/TokenContext";
import { useStellarWallet } from "../../hooks/useStellarWallet";
import { formatCurrency, formatNumber } from "../../utils/formatting";
import Card from "../common/Card";

export default function Statistics() {
  const { tokens } = useTokens();
  const { balance } = useStellarWallet();

  const stats = [
    {
      label: "Total Tokens",
      value: formatNumber(tokens.length, 0),
      icon: "🪙",
      color: "from-purple-400 to-purple-600",
    },
    {
      label: "Your Balance",
      value: formatCurrency(balance, "XLM"),
      icon: "💰",
      color: "from-blue-400 to-blue-600",
    },

    {
      label: "Network",
      value: "Testnet",
      icon: "⚡",
      color: "from-yellow-400 to-yellow-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="relative overflow-hidden">
          <div
            className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-10 rounded-full -mr-8 -mt-8`}
          />
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                {stat.label}
              </span>
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
