import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTokens } from "../../context/TokenContext";
import { useWallet } from "../../context/WalletContext";
import TokenCard from "./TokenCard";
import Card from "../common/Card";
import Button from "../common/Button";

export default function TokenList() {
  const navigate = useNavigate();
  const { tokens, loading, error, refreshTokens } = useTokens();
  const { publicKey, isConnected } = useWallet();

  useEffect(() => {
    if (isConnected && publicKey) {
      console.log("TokenList: Auto-loading tokens");
      refreshTokens();
    }
  }, [isConnected, publicKey]);

  if (!isConnected) {
    return (
      <Card className="text-center py-16">
        <div className="inline-block p-6 bg-gray-100 rounded-full mb-4">
          <span className="text-6xl">🔒</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          Connect Your Wallet
        </h3>
        <p className="text-gray-600 mb-6">
          Please connect your wallet to view tokens
        </p>
      </Card>
    );
  }

  if (loading && tokens.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-600 mb-4"></div>
        <p className="text-gray-600">Loading tokens from blockchain...</p>
      </div>
    );
  }

  if (error && tokens.length === 0) {
    return (
      <Card className="text-center py-16 bg-red-50 border-red-200">
        <div className="inline-block p-6 bg-red-100 rounded-full mb-4">
          <span className="text-6xl">⚠️</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          Failed to Load Tokens
        </h3>
        <p className="text-red-600 mb-6">{error}</p>
        <Button onClick={refreshTokens} variant="secondary">
          Try Again
        </Button>
      </Card>
    );
  }

  if (tokens.length === 0 && !loading) {
    return (
      <Card className="text-center py-16">
        <div className="inline-block p-6 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full mb-4">
          <span className="text-6xl">🚀</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          No Tokens Found
        </h3>
        <p className="text-gray-600 mb-6">
          Create your first meme coin to get started!
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={refreshTokens} variant="secondary">
            🔄 Refresh
          </Button>
          <Button onClick={() => navigate("/create")}>+ Create Token</Button>
        </div>
      </Card>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          All Tokens ({tokens.length})
        </h2>
        {loading && (
          <span className="text-sm text-gray-500 animate-pulse">
            Refreshing...
          </span>
        )}
      </div>

      {/* Error banner */}
      {error && tokens.length > 0 && (
        <Card className="mb-6 bg-yellow-50 border-yellow-200">
          <div className="flex items-center justify-between">
            <p className="text-yellow-800">⚠️ {error}</p>
            <Button onClick={refreshTokens} variant="secondary" size="sm">
              Retry
            </Button>
          </div>
        </Card>
      )}

      {/* Token Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tokens.map((token) => (
          <TokenCard key={token.token_id || token.id} token={token} />
        ))}
      </div>
    </div>
  );
}
