import React from "react";
import Card from "../common/Card";
import Table from "../common/Table";
import { formatNumber, formatRelativeTime } from "../../utils/formatting";

export default function TradeHistory({ trades = [] }) {
  const headers = ["Type", "Price (XLM)", "Amount", "Total (XLM)", "Time"];

  const renderRow = (trade, index) => (
    <tr key={index} className="hover:bg-gray-50">
      <td className="px-6 py-4">
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
            trade.type === "BUY"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {trade.type}
        </span>
      </td>
      <td className="px-6 py-4 text-sm font-semibold text-gray-800">
        {formatNumber(trade.price, 7)}
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">
        {formatNumber(trade.amount, 7)}
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">
        {formatNumber(trade.price * trade.amount, 7)}
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">
        {formatRelativeTime(trade.timestamp)}
      </td>
    </tr>
  );

  return (
    <Card>
      <h3 className="text-lg font-bold text-gray-800 mb-4">Trade History</h3>
      <Table headers={headers} data={trades} renderRow={renderRow} />
    </Card>
  );
}
