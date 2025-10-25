import React from "react";
import Card from "../common/Card";

export default function TokenList({ tokens }) {
  const formatSupply = (supply, decimals = 7) => {
    const formatted = (supply / Math.pow(10, decimals)).toLocaleString();
    return formatted;
  };

  if (tokens.length === 0) {
    return null;
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-4 px-4 font-semibold text-gray-700">
                #
              </th>
              <th className="text-left py-4 px-4 font-semibold text-gray-700">
                Token Name
              </th>
              <th className="text-left py-4 px-4 font-semibold text-gray-700">
                Symbol
              </th>
              <th className="text-left py-4 px-4 font-semibold text-gray-700">
                Total Supply
              </th>
              <th className="text-left py-4 px-4 font-semibold text-gray-700">
                Decimals
              </th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((token) => (
              <tr
                key={token.token_id}
                className="border-b border-gray-100 hover:bg-gray-50 transition"
              >
                <td className="py-4 px-4 text-gray-600">{token.token_id}</td>
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {token.symbol.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {token.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {token.contract_address.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                    {token.symbol}
                  </span>
                </td>
                <td className="py-4 px-4 font-mono text-gray-700">
                  {formatSupply(token.total_supply, token.decimals)}
                </td>
                <td className="py-4 px-4 text-gray-600">{token.decimals}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
