import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTokens } from "../../context/TokenContext";
import { useWallet } from "../../context/WalletContext";
import TokenList from "./TokenList";
import Button from "../common/Button";
import Card from "../common/Card";

export default function Dashboard() {
  const navigate = useNavigate();
  const { publicKey } = useWallet();
  const { tokens, loading, error, refreshTokens } = useTokens();

  useEffect(() => {
    console.log("Dashboard mounted");
    refreshTokens();
  }, []);

  if (loading && tokens.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
        <p className="mt-4 text-gray-600">Loading tokens...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Your Meme Coins
          </h1>
          <p className="text-gray-600">
            {tokens.length > 0
              ? `${tokens.length} token${tokens.length > 1 ? "s" : ""} found`
              : "No tokens yet"}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={refreshTokens}
            variant="secondary"
            disabled={loading}
          >
            {loading ? "🔄" : "🔄"} Refresh
          </Button>
          <Button onClick={() => navigate("/create")}>+ Create Token</Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <Card className="mb-6 bg-red-50 border-red-200">
          <p className="text-red-800">⚠️ {error}</p>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <span className="text-3xl">🪙</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Tokens</p>
              <p className="text-2xl font-bold text-gray-800">
                {tokens.length}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <span className="text-3xl">👤</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Your Address</p>
              <p className="text-xs font-mono text-gray-800 truncate max-w-[150px]">
                {publicKey}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <span className="text-3xl">⚡</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Network</p>
              <p className="text-xl font-bold text-green-600">Testnet</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Token List */}
      {tokens.length === 0 ? (
        <Card className="text-center py-20">
          <div className="text-6xl mb-4">🚀</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            No Tokens Found
          </h2>
          <p className="text-gray-600 mb-6">
            Create your first meme coin to get started!
          </p>
          <Button onClick={() => navigate("/create")}>
            Create Your First Token
          </Button>
        </Card>
      ) : (
        <>
          <div className="mb-4 flex justify-between items-center">
            {loading && (
              <span className="text-gray-500 text-sm">Refreshing...</span>
            )}
          </div>
          <TokenList tokens={tokens} />
        </>
      )}
    </div>
  );
}
