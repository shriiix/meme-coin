import React, { useState } from "react";
import { useTrade } from "../../hooks/useTrade";
import Input from "../common/Input";
import Button from "../common/Button";
import { validateAmount, validatePrice } from "../../utils/validation";

export default function SellForm({ token, onSuccess }) {
  const { createSellOrder, loading } = useTrade();
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
      // Use contract_address instead of contract_id
      await createSellOrder(
        token.contract_address,
        parseFloat(formData.amount),
        parseFloat(formData.price)
      );
      onSuccess();
    } catch (error) {
      console.error("Sell failed:", error);
    }
  };

  const totalReceive =
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
        helperText={`How many ${token.symbol} to sell`}
        step="0.0001"
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
        step="0.0001"
        required
      />

      {/* Total Receive */}
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">You'll Receive</span>
          <span className="text-xl font-bold text-gray-800">
            {totalReceive.toFixed(7)} XLM
          </span>
        </div>
      </div>

      <Button type="submit" loading={loading} fullWidth>
        {loading ? "Processing..." : "Create Sell Order"}
      </Button>
    </form>
  );
}
