import React from "react";
import { useWallet } from "../../context/WalletContext";
import Button from "../common/Button";

export default function WalletConnect() {
  const { connectWallet, isLoading } = useWallet();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute top-40 right-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute bottom-20 left-40 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="relative bg-white p-10 rounded-2xl shadow-2xl text-center max-w-md w-full mx-4 backdrop-blur-sm bg-opacity-95">
        {/* Logo and Header */}
        <div className="mb-8">
          <div className="inline-block mb-4 p-4 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full">
            <span className="text-6xl">🚀</span>
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            MemeCoin Platform
          </h1>
          <p className="text-gray-600">
            Create, Trade, and Discover Meme Coins on Stellar
          </p>
        </div>

        {/* Features */}
        <div className="mb-8 space-y-3">
          <div className="flex items-center space-x-3 text-left p-3 bg-blue-50 rounded-lg">
            <span className="text-2xl">✨</span>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                Create Tokens
              </p>
              <p className="text-xs text-gray-600">Launch your own meme coin</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 text-left p-3 bg-purple-50 rounded-lg">
            <span className="text-2xl">💰</span>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                Trade Instantly
              </p>
              <p className="text-xs text-gray-600">Buy and sell with ease</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 text-left p-3 bg-indigo-50 rounded-lg">
            <span className="text-2xl">⚡</span>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                Fast & Secure
              </p>
              <p className="text-xs text-gray-600">Powered by Stellar</p>
            </div>
          </div>
        </div>

        {/* Connect Button */}
        <Button onClick={connectWallet} loading={isLoading} fullWidth size="lg">
          {isLoading ? "Connecting..." : "Connect Wallet"}
        </Button>

        {/* Wallet Info */}
        <div className="mt-6 text-xs text-gray-500">
          <p>Supported wallets: Freighter, xBull</p>
          <p className="mt-2">
            Don't have a wallet?{" "}
            <a
              href="https://freighter.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:underline font-semibold"
            >
              Get Freighter →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
