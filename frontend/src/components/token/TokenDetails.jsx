import React from "react";
import { useParams } from "react-router-dom";
import {
  formatNumber,
  formatAddress,
  stroopsToXLM,
} from "../../utils/formatting";
import Card from "../common/Card";

export default function TokenDetails() {
  const { id } = useParams();

  // This would be fetched from the blockchain
  const token = {
    id,
    name: "Sample Token",
    symbol: "SMPL",
    creator: "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    total_supply: 1000000 * 10000000,
    decimals: 7,
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Token Details</h1>

        <div className="space-y-4">
          <div className="flex justify-between py-3 border-b">
            <span className="text-gray-600">Name</span>
            <span className="font-semibold">{token.name}</span>
          </div>
          <div className="flex justify-between py-3 border-b">
            <span className="text-gray-600">Symbol</span>
            <span className="font-semibold">{token.symbol}</span>
          </div>
          <div className="flex justify-between py-3 border-b">
            <span className="text-gray-600">Total Supply</span>
            <span className="font-semibold">
              {formatNumber(stroopsToXLM(token.total_supply))}
            </span>
          </div>
          <div className="flex justify-between py-3 border-b">
            <span className="text-gray-600">Creator</span>
            <span className="font-mono text-sm">
              {formatAddress(token.creator, 8, 8)}
            </span>
          </div>
          <div className="flex justify-between py-3">
            <span className="text-gray-600">Decimals</span>
            <span className="font-semibold">{token.decimals}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
