import React, { useState } from "react";
import { Link } from "react-router-dom";
import TokenList from "./TokenList";
import UserPortfolio from "./UserPortfolio";
import Statistics from "./Statistics";
import Button from "../common/Button";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'portfolio'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Explore and trade StellarCoin on Stellar
          </p>
        </div>
        {/* <Link to="/create">
          <Button size="lg">+ Create New Token</Button>
        </Link> */}
      </div>

      {/* Statistics */}
      <Statistics />

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("all")}
          className={`pb-4 px-2 font-semibold transition-all ${
            activeTab === "all"
              ? "border-b-2 border-purple-600 text-purple-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          All Tokens
        </button>
        <button
          onClick={() => setActiveTab("portfolio")}
          className={`pb-4 px-2 font-semibold transition-all ${
            activeTab === "portfolio"
              ? "border-b-2 border-purple-600 text-purple-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          My Portfolio
        </button>
      </div>

      {/* Content */}
      <div>
        {activeTab === "all" && <TokenList />}
        {activeTab === "portfolio" && <UserPortfolio />}
      </div>
    </div>
  );
}
