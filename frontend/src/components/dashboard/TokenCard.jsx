import React, { useState } from "react";
import {
  formatNumber,
  formatAddress,
  stroopsToXLM,
} from "../../utils/formatting";
import Card from "../common/Card";
import TradeModal from "../trading/TradeModal";
import Button from "../common/Button";

export default function TokenCard({ token }) {
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [tradeType, setTradeType] = useState("buy"); // 'buy' | 'sell'

  const handleTrade = (type) => {
    setTradeType(type);
    setShowTradeModal(true);
  };

  return (
    <>
      <Card hover className="flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-2xl">
              {token.symbol?.charAt(0) || "🪙"}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                {token.symbol}
              </h3>
              <p className="text-sm text-gray-600">{token.name}</p>
            </div>
          </div>
          <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-semibold">
            Meme
          </span>
        </div>

        {/* Stats */}
        <div className="flex-1 space-y-3 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Supply</span>
            <span className="text-sm font-semibold text-gray-800">
              {formatNumber(stroopsToXLM(token.total_supply))}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Creator</span>
            <span className="text-sm font-mono text-gray-800">
              {formatAddress(token.creator, 4, 4)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Decimals</span>
            <span className="text-sm font-semibold text-gray-800">
              {token.decimals}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200">
          <Button
            variant="success"
            size="sm"
            onClick={() => handleTrade("buy")}
            fullWidth
          >
            Buy
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleTrade("sell")}
            fullWidth
          >
            Sell
          </Button>
        </div>
      </Card>

      {/* Trade Modal */}
      <TradeModal
        isOpen={showTradeModal}
        onClose={() => setShowTradeModal(false)}
        token={token}
        type={tradeType}
      />
    </>
  );
}
