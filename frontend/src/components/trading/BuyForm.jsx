import React, { useState } from "react";
import { useTrade } from "../../hooks/useTrade";
import Input from "../common/Input";
import Button from "../common/Button";
import { validateAmount, validatePrice } from "../../utils/validation";

export default function BuyForm({ token, onSuccess }) {
  const { buyTokens, loading } = useTrade();
  const [formData, setFormData] = useState({
    amount: "",
    price: "",
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

    const priceError = validatePrice(formData.price);
    if (priceError) newErrors.price = priceError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      // In real implementation, orderId would come from order book
      await buyTokens(1);
      onSuccess();
    } catch (error) {
      console.error("Buy failed:", error);
    }
  };

  const totalCost =
    (parseFloat(formData.amount) || 0) * (parseFloat(formData.price) || 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Amount"
        name="amount"
        type="number"
        value={formData.amount}
        onChange={handleChange}
        placeholder="0.00"
        error={errors.amount}
        helperText={`How many ${token.symbol} to buy`}
        step="0.0000001"
        required
      />

      <Input
        label="Price per token (XLM)"
        name="price"
        type="number"
        value={formData.price}
        onChange={handleChange}
        placeholder="0.00"
        error={errors.price}
        helperText="Price in XLM per token"
        step="0.0000001"
        required
      />

      {/* Total Cost */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
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
