import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

export default function PriceChart({ currentPrice, symbol }) {
  // Generate dummy historical data based on current price
  const generateDummyData = (price) => {
    const data = [];
    const now = Date.now();
    const priceNum = typeof price === "bigint" ? Number(price) : price;
    const currentPriceXLM = priceNum / 10_000_000;

    // Generate 24 hours of dummy data (hourly)
    for (let i = 23; i >= 0; i--) {
      const timestamp = now - i * 60 * 60 * 1000;
      const time = new Date(timestamp).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const variation = (Math.random() - 0.5) * 0.2;
      const historicalPrice =
        currentPriceXLM * (1 - (i / 24) * 0.1) * (1 + variation);

      data.push({
        time,
        price: Math.max(historicalPrice, currentPriceXLM * 0.5),
        volume: Math.random() * 1000 + 100,
      });
    }

    data.push({
      time: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      price: currentPriceXLM,
      volume: Math.random() * 1000 + 100,
    });

    return data;
  };

  const chartData = currentPrice ? generateDummyData(currentPrice) : [];

  const priceChange =
    chartData.length > 1
      ? (
          ((chartData[chartData.length - 1].price - chartData[0].price) /
            chartData[0].price) *
          100
        ).toFixed(2)
      : 0;

  const isPositive = priceChange >= 0;

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{symbol} / XLM</h3>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`text-sm font-semibold ${
                isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {isPositive ? "↑" : "↓"} {Math.abs(priceChange)}%
            </span>
            <span className="text-xs text-gray-500">24h</span>
          </div>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-xs font-semibold">
            24H
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="time" tick={{ fontSize: 12 }} stroke="#888" />
          <YAxis
            tick={{ fontSize: 12 }}
            stroke="#888"
            domain={["auto", "auto"]}
            tickFormatter={(value) => value.toFixed(8)}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "10px",
            }}
            formatter={(value) => [value.toFixed(8) + " XLM", "Price"]}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke="#8b5cf6"
            strokeWidth={2}
            fill="url(#colorPrice)"
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-xs text-gray-500">24h High</p>
          <p className="text-sm font-semibold text-gray-800">
            {chartData.length > 0
              ? Math.max(...chartData.map((d) => d.price)).toFixed(8)
              : "0.00000000"}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">24h Low</p>
          <p className="text-sm font-semibold text-gray-800">
            {chartData.length > 0
              ? Math.min(...chartData.map((d) => d.price)).toFixed(8)
              : "0.00000000"}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">24h Volume</p>
          <p className="text-sm font-semibold text-gray-800">
            {chartData.length > 0
              ? chartData.reduce((sum, d) => sum + d.volume, 0).toFixed(2)
              : "0.00"}{" "}
            XLM
          </p>
        </div>
      </div>
    </div>
  );
}
