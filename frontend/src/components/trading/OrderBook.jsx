import React from "react";
import Card from "../common/Card";
import Table from "../common/Table";
import { formatNumber, formatRelativeTime } from "../../utils/formatting";

export default function OrderBook({ orders = [] }) {
  const headers = ["Price (XLM)", "Amount", "Total (XLM)", "Time"];

  const renderRow = (order, index) => (
    <tr key={index} className="hover:bg-gray-50">
      <td className="px-6 py-4 text-sm font-semibold text-gray-800">
        {formatNumber(order.price, 7)}
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">
        {formatNumber(order.amount, 7)}
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">
        {formatNumber(order.price * order.amount, 7)}
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">
        {formatRelativeTime(order.timestamp)}
      </td>
    </tr>
  );

  return (
    <Card>
      <h3 className="text-lg font-bold text-gray-800 mb-4">Order Book</h3>
      <Table headers={headers} data={orders} renderRow={renderRow} />
    </Card>
  );
}
