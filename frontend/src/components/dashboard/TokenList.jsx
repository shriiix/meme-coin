import React, { useEffect } from "react";
import { useTokens } from "../../context/TokenContext";
import { useWallet } from "../../context/WalletContext";
import { TokenFactoryService } from "../../services/tokenFactory";
import TokenCard from "./TokenCard";
import Loader from "../common/Loader";
import { Link } from "react-router-dom";

export default function TokenList() {
  const { tokens, setTokens, loading, setLoading, refreshTrigger } =
    useTokens();
  const { kit, publicKey } = useWallet();

  useEffect(() => {
    if (kit && publicKey) {
      loadTokens();
    }
  }, [kit, publicKey, refreshTrigger]);

  const loadTokens = async () => {
    setLoading(true);
    try {
      const service = new TokenFactoryService(kit, publicKey);
      const allTokens = await service.getAllTokens();
      setTokens(allTokens);
    } catch (error) {
      console.error("Failed to load tokens:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader text="Loading tokens..." />;
  }

  if (tokens.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-block p-6 bg-gray-100 rounded-full mb-4">
          <span className="text-6xl">🪙</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">No Tokens Yet</h3>
        <p className="text-gray-600 mb-6">
          Be the first to create a meme coin on the platform!
        </p>
        <Link to="/create">
          <button className="btn-primary">Create Your First Token</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tokens.map((token) => (
        <TokenCard key={token.id} token={token} />
      ))}
    </div>
  );
}
