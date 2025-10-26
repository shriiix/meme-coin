import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useWallet } from "../../context/WalletContext";

export default function Header() {
  const { publicKey, disconnectWallet } = useWallet();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-3xl">🚀</span>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              StellarCoin
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                isActive("/")
                  ? "bg-purple-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/create"
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                isActive("/create")
                  ? "bg-purple-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Create Token
            </Link>
          </nav>

          {/* Wallet Info */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:block bg-gray-100 px-4 py-2 rounded-lg">
              <span className="text-sm text-gray-600 font-mono">
                {publicKey?.substring(0, 4)}...
                {publicKey?.substring(publicKey.length - 4)}
              </span>
            </div>
            <button
              onClick={disconnectWallet}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all text-sm font-medium"
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
