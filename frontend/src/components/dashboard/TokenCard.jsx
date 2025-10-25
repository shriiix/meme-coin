import React from "react";
import { useNavigate } from "react-router-dom";
import Card from "../common/Card";

export default function TokenCard({ token }) {
  const navigate = useNavigate();

  const formatSupply = (supply, decimals = 7) => {
    try {
      // Handle BigInt conversion
      const supplyNum = typeof supply === "bigint" ? Number(supply) : supply;
      const decimalsNum =
        typeof decimals === "bigint" ? Number(decimals) : decimals;

      // Calculate the actual value
      const divisor = Math.pow(10, decimalsNum);
      const formattedValue = (supplyNum / divisor).toLocaleString(undefined, {
        maximumFractionDigits: 2,
      });

      return formattedValue;
    } catch (error) {
      console.error("Error formatting supply:", error);
      return "0";
    }
  };

  const formatAddress = (address) => {
    if (!address) return "N/A";
    if (address.length <= 16) return address;
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  return (
    <Card
      className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105"
      onClick={() => navigate(`/token/${token.token_id}`)}
    >
      {/* Token Header */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-2xl font-bold text-white">
            {token.symbol?.charAt(0) || "?"}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-xl text-gray-800 truncate">
            {token.name || "Unknown Token"}
          </h3>
          <p className="text-sm text-gray-600 font-semibold">
            {token.symbol || "???"}
          </p>
        </div>
      </div>

      {/* Token Stats */}
      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Total Supply</span>
          <span className="font-semibold text-gray-800">
            {formatSupply(token.total_supply, token.decimals)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Decimals</span>
          <span className="font-semibold text-gray-800">
            {typeof token.decimals === "bigint"
              ? Number(token.decimals)
              : token.decimals}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Token ID</span>
          <span className="font-semibold text-purple-600">
            #
            {typeof token.token_id === "bigint"
              ? Number(token.token_id)
              : token.token_id}
          </span>
        </div>
      </div>

      {/* Contract Address */}
      <div className="pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 mb-1">Contract Address</p>
        <p className="text-xs font-mono text-gray-700 truncate">
          {formatAddress(token.contract_address)}
        </p>
      </div>

      {/* Hover indicator */}
      <div className="mt-4 text-center">
        <span className="text-xs text-purple-600 font-semibold">
          Click to view details →
        </span>
      </div>
    </Card>
  );
}
