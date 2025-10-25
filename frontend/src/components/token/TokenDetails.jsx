import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTokens } from "../../context/TokenContext";
import Card from "../common/Card";
import Button from "../common/Button";

export default function TokenDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tokens } = useTokens();
  const [token, setToken] = useState(null);

  useEffect(() => {
    const foundToken = tokens.find((t) => {
      const tokenId =
        typeof t.token_id === "bigint" ? Number(t.token_id) : t.token_id;
      return tokenId === parseInt(id);
    });
    if (foundToken) {
      setToken(foundToken);
    }
  }, [id, tokens]);

  const formatSupply = (supply, decimals = 7) => {
    try {
      const supplyNum = typeof supply === "bigint" ? Number(supply) : supply;
      const decimalsNum =
        typeof decimals === "bigint" ? Number(decimals) : decimals;
      const divisor = Math.pow(10, decimalsNum);
      return (supplyNum / divisor).toLocaleString();
    } catch (error) {
      return "0";
    }
  };

  const formatAddress = (address, start = 8, end = 8) => {
    if (!address) return "N/A";
    if (address.length <= start + end) return address;
    return `${address.slice(0, start)}...${address.slice(-end)}`;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown";
    const ts = typeof timestamp === "bigint" ? Number(timestamp) : timestamp;
    return new Date(ts * 1000).toLocaleDateString();
  };

  if (!token) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Token Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              Token #{id} could not be found.
            </p>
            <Button onClick={() => navigate("/")}>Back to Dashboard</Button>
          </div>
        </Card>
      </div>
    );
  }

  const tokenId =
    typeof token.token_id === "bigint"
      ? Number(token.token_id)
      : token.token_id;
  const decimals =
    typeof token.decimals === "bigint"
      ? Number(token.decimals)
      : token.decimals;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <div className="mb-6">
        <Button variant="secondary" onClick={() => navigate("/")}>
          ← Back to Dashboard
        </Button>
      </div>

      {/* Token Header */}
      <Card className="mb-6">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-4xl font-bold text-white">
              {token.symbol?.charAt(0) || "?"}
            </span>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              {token.name}
            </h1>
            <div className="flex items-center space-x-3">
              <span className="px-4 py-1 bg-purple-100 text-purple-700 rounded-full text-lg font-semibold">
                {token.symbol}
              </span>
              <span className="text-gray-500">Token #{tokenId}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-1">Total Supply</p>
            <p className="text-2xl font-bold text-gray-800">
              {formatSupply(token.total_supply, decimals)}
            </p>
            <p className="text-xs text-gray-500 mt-1">{token.symbol}</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-1">Decimals</p>
            <p className="text-2xl font-bold text-gray-800">{decimals}</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-1">Created</p>
            <p className="text-2xl font-bold text-gray-800">
              {formatDate(token.created_at)}
            </p>
          </div>
        </Card>
      </div>

      {/* Token Information */}
      <Card>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Token Information
        </h2>

        <div className="space-y-4">
          <div className="flex justify-between py-4 border-b">
            <span className="text-gray-600 font-medium">Token Name</span>
            <span className="font-semibold text-gray-800">{token.name}</span>
          </div>

          <div className="flex justify-between py-4 border-b">
            <span className="text-gray-600 font-medium">Symbol</span>
            <span className="font-semibold text-gray-800">{token.symbol}</span>
          </div>

          <div className="flex justify-between py-4 border-b">
            <span className="text-gray-600 font-medium">Total Supply</span>
            <div className="text-right">
              <p className="font-semibold text-gray-800">
                {formatSupply(token.total_supply, decimals)} {token.symbol}
              </p>
              <p className="text-xs text-gray-500 font-mono">
                {typeof token.total_supply === "bigint"
                  ? token.total_supply.toString()
                  : token.total_supply.toLocaleString()}{" "}
                stroops
              </p>
            </div>
          </div>

          <div className="flex justify-between py-4 border-b">
            <span className="text-gray-600 font-medium">Creator</span>
            <div className="text-right">
              <p className="font-mono text-sm text-gray-800">
                {formatAddress(token.creator, 10, 10)}
              </p>
              <a
                href={`https://stellar.expert/explorer/testnet/account/${token.creator}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-purple-600 hover:underline"
              >
                View on Explorer →
              </a>
            </div>
          </div>

          <div className="flex justify-between py-4">
            <span className="text-gray-600 font-medium">Contract Address</span>
            <div className="text-right">
              <p className="font-mono text-sm text-gray-800">
                {formatAddress(token.contract_address, 10, 10)}
              </p>
              <a
                href={`https://stellar.expert/explorer/testnet/contract/${token.contract_address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-purple-600 hover:underline"
              >
                View Contract →
              </a>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
