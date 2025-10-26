import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../../context/WalletContext";
import { useTokens } from "../../context/TokenContext";
import { TokenFactoryService } from "../../services/tokenFactory";
import TokenForm from "./TokenForm";
import Card from "../common/Card";
import toast from "react-hot-toast";

export default function CreateToken() {
  const navigate = useNavigate();
  const { kit, publicKey } = useWallet();
  const { refreshTokens } = useTokens();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setLoading(true);
    const toastId = toast.loading("Creating token...");

    try {
      console.log("📝 Creating token with data:", formData);

      const service = new TokenFactoryService(kit, publicKey);
      const result = await service.createToken(
        formData.name,
        formData.symbol,
        formData.decimals,
        formData.initialSupply
      );

      console.log("✅ Token creation result:", result);

      toast.success("Token created successfully! 🎉", { id: toastId });

      // Wait for transaction to be processed
      console.log("⏳ Waiting for blockchain confirmation...");
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Refresh token list
      console.log("🔄 Refreshing token list...");
      await refreshTokens();

      // Navigate to dashboard
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      console.error("❌ Token creation failed:", error);
      toast.error(error.message || "Failed to create token", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-block p-4 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full mb-4">
          <span className="text-5xl">🚀</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Create Your StellarCoin
        </h1>
        <p className="text-gray-600">
          Launch your own token on the Stellar blockchain
        </p>
      </div>

      {/* Form */}
      <Card>
        <TokenForm onSubmit={handleSubmit} loading={loading} />
      </Card>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <Card className="text-center">
          <div className="text-3xl mb-2">⚡</div>
          <h3 className="font-semibold text-gray-800 mb-1">Fast</h3>
          <p className="text-sm text-gray-600">Deploy in seconds on Stellar</p>
        </Card>
        <Card className="text-center">
          <div className="text-3xl mb-2">💰</div>
          <h3 className="font-semibold text-gray-800 mb-1">Low Cost</h3>
          <p className="text-sm text-gray-600">Minimal fees for deployment</p>
        </Card>
        <Card className="text-center">
          <div className="text-3xl mb-2">🔒</div>
          <h3 className="font-semibold text-gray-800 mb-1">Secure</h3>
          <p className="text-sm text-gray-600">Built on proven blockchain</p>
        </Card>
      </div>
    </div>
  );
}
