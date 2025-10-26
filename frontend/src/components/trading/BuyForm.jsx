import React, { useState } from "react";
import { useTrade } from "../../hooks/useTrade";
import Input from "../common/Input";
import Button from "../common/Button";
import { validateAmount, validatePrice } from "../../utils/validation";

export default function BuyForm({ token, order, onSuccess }) {
  const { buyTokens, loading } = useTrade();
  const [formData, setFormData] = useState({
    amount: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    const amountError = validateAmount(formData.amount);
    if (amountError) newErrors.amount = amountError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await buyTokens(order.order_id, parseFloat(formData.amount));
      onSuccess();
    } catch (error) {
      console.error("Buy failed:", error);
    }
  };

  // Calculate based on order price
  const pricePerToken = order?.price_per_token
    ? (typeof order.price_per_token === "bigint"
        ? Number(order.price_per_token)
        : order.price_per_token) / Math.pow(10, 7)
    : 0;

  const totalCost = (parseFloat(formData.amount) || 0) * pricePerToken;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Order Info */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-600">Price per Token</span>
          <span className="font-semibold">{pricePerToken.toFixed(7)} XLM</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Available</span>
          <span className="font-semibold">
            {order?.amount
              ? (
                  (typeof order.amount === "bigint"
                    ? Number(order.amount)
                    : order.amount) / Math.pow(10, 7)
                ).toFixed(4)
              : "0"}{" "}
            {token.symbol}
          </span>
        </div>
      </div>

      <Input
        label="Amount to Buy"
        name="amount"
        type="number"
        value={formData.amount}
        onChange={handleChange}
        placeholder="0.00"
        error={errors.amount}
        helperText={`How many ${token.symbol} to buy`}
        step="0.0001"
        required
      />

      {/* Total Cost */}
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Total Cost</span>
          <span className="text-xl font-bold text-gray-800">
            {totalCost.toFixed(7)} XLM
          </span>
        </div>
      </div>

      <Button type="submit" loading={loading} fullWidth variant="success">
        {loading ? "Processing..." : "Buy Tokens"}
      </Button>
    </form>
  );
}
