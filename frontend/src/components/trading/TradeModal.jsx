import React, { useState } from "react";
import Modal from "../common/Modal";
import BuyForm from "./BuyForm";
import SellForm from "./SellForm";

export default function TradeModal({ isOpen, onClose, token, type }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${type === "buy" ? "Buy" : "Sell"} ${token.symbol}`}
      size="md"
    >
      <div className="space-y-4">
        {/* Token Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-xl">
              {token.symbol?.charAt(0) || "🪙"}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                {token.symbol}
              </h3>
              <p className="text-sm text-gray-600">{token.name}</p>
            </div>
          </div>
        </div>

        {/* Trade Form */}
        {type === "buy" ? (
          <BuyForm token={token} onSuccess={onClose} />
        ) : (
          <SellForm token={token} onSuccess={onClose} />
        )}
      </div>
    </Modal>
  );
}
