import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTokens } from "../../context/TokenContext";
import { useTrade } from "../../hooks/useTrade";
import Card from "../common/Card";
import Button from "../common/Button";
import BuyForm from "../trading/BuyForm";
import SellForm from "../trading/SellForm";
import PriceChart from "../chart/PriceChart";
export default function TokenDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tokens } = useTokens();
  const { getTokenOrders } = useTrade();
  const [token, setToken] = useState(null);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("buy"); // 'buy' or 'sell'
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const foundToken = tokens.find((t) => {
      const tokenId =
        typeof t.token_id === "bigint" ? Number(t.token_id) : t.token_id;
      return tokenId === parseInt(id);
    });
    if (foundToken) {
      setToken(foundToken);
      loadOrders(foundToken.contract_address);
    }
  }, [id, tokens]);

  const loadOrders = async (contractAddress) => {
    try {
      const tokenOrders = await getTokenOrders(contractAddress);
      setOrders(tokenOrders.filter((o) => o.is_active));
    } catch (error) {
      console.error("Failed to load orders:", error);
    }
  };

  const handleBuySuccess = () => {
    setShowBuyModal(false);
    if (token) {
      loadOrders(token.contract_address);
    }
  };

  const handleSellSuccess = () => {
    setShowSellModal(false);
    if (token) {
      loadOrders(token.contract_address);
    }
  };

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

  if (!token) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Token Not Found
            </h2>
            <Button onClick={() => navigate("/")}>Back to Dashboard</Button>
          </div>
        </Card>
      </div>
    );
  }

  const decimals =
    typeof token.decimals === "bigint"
      ? Number(token.decimals)
      : token.decimals;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back Button */}
      <div className="mb-6">
        <Button variant="secondary" onClick={() => navigate("/")}>
          ← Back
        </Button>
      </div>

      {/* Token Header */}
      <Card className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-4xl font-bold text-white">
                {token.symbol?.charAt(0)}
              </span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                {token.name}
              </h1>
              <span className="px-4 py-1 bg-purple-100 text-purple-700 rounded-full text-lg font-semibold">
                {token.symbol}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            {/* <Button onClick={() => setShowBuyModal(true)}>💰 Buy</Button> */}
            <Button onClick={() => setShowSellModal(true)} variant="secondary">
              💸 Sell
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Token Info - Left Side */}
        <div className="lg:col-span-1 space-y-6">
          {/* Stats */}
          <Card>
            <h3 className="font-bold text-lg mb-4">Token Stats</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Total Supply</p>
                <p className="text-lg font-semibold">
                  {formatSupply(token.total_supply, decimals)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Decimals</p>
                <p className="text-lg font-semibold">{decimals}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Orders</p>
                <p className="text-lg font-semibold">{orders.length}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <h3 className="font-bold text-2xl mb-6">Order Book</h3>

            {orders.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">📋</div>
                <p className="text-gray-600 mb-4">No active orders</p>
                <Button onClick={() => setShowSellModal(true)}>
                  Create First Sell Order
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Amount</th>
                      <th className="text-left py-3 px-4">Price (XLM)</th>
                      <th className="text-left py-3 px-4">Total (XLM)</th>
                      <th className="text-right py-3 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => {
                      const amount = formatSupply(order.amount, decimals);
                      const price = formatSupply(order.price_per_token, 7);
                      const total = (
                        parseFloat(amount) * parseFloat(price)
                      ).toFixed(4);

                      return (
                        <tr
                          key={order.order_id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="py-3 px-4">{amount}</td>
                          <td className="py-3 px-4">{price}</td>
                          <td className="py-3 px-4">{total}</td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowBuyModal(true);
                              }}
                            >
                              Buy
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Buy Modal */}
      {showBuyModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Buy {token.symbol}</h2>
              <button
                onClick={() => setShowBuyModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <BuyForm
              token={token}
              order={selectedOrder}
              onSuccess={handleBuySuccess}
            />
          </Card>
        </div>
      )}

      {/* Sell Modal */}
      {showSellModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Sell {token.symbol}</h2>
              <button
                onClick={() => setShowSellModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <SellForm token={token} onSuccess={handleSellSuccess} />
          </Card>
        </div>
      )}
    </div>
  );
}
