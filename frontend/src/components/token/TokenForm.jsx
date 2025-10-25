import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../common/Input";
import Button from "../common/Button";
import {
  validateTokenName,
  validateTokenSymbol,
  validateTokenSupply,
} from "../../utils/validation";

export default function TokenForm({ onSubmit, loading }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    decimals: 7,
    initialSupply: "1000000",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "symbol" ? value.toUpperCase() : value,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    const nameError = validateTokenName(formData.name);
    if (nameError) newErrors.name = nameError;

    const symbolError = validateTokenSymbol(formData.symbol);
    if (symbolError) newErrors.symbol = symbolError;

    const supplyError = validateTokenSupply(formData.initialSupply);
    if (supplyError) newErrors.initialSupply = supplyError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Token Name */}
      <Input
        label="Token Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="e.g., Doge Coin"
        error={errors.name}
        helperText="Choose a catchy name for your meme coin"
        required
      />

      {/* Token Symbol */}
      <Input
        label="Token Symbol"
        name="symbol"
        value={formData.symbol}
        onChange={handleChange}
        placeholder="e.g., DOGE"
        error={errors.symbol}
        helperText="2-12 characters, uppercase letters and numbers only"
        maxLength={12}
        required
      />

      {/* Decimals */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Decimals
        </label>
        <select
          name="decimals"
          value={formData.decimals}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
        >
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <option key={num} value={num}>
              {num} {num === 7 && "(Recommended)"}
            </option>
          ))}
        </select>
        <p className="mt-1 text-sm text-gray-500">
          Number of decimal places (7 is standard for Stellar)
        </p>
      </div>

      {/* Initial Supply */}
      <Input
        label="Initial Supply"
        name="initialSupply"
        type="number"
        value={formData.initialSupply}
        onChange={handleChange}
        placeholder="1000000"
        error={errors.initialSupply}
        helperText="Total number of tokens to create"
        min="1"
        required
      />

      {/* Summary Box */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border border-purple-200">
        <h3 className="font-semibold text-gray-800 mb-3">Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Token:</span>
            <span className="font-semibold text-gray-800">
              {formData.name || "-"} ({formData.symbol || "-"})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Supply:</span>
            <span className="font-semibold text-gray-800">
              {parseInt(formData.initialSupply || 0).toLocaleString()}{" "}
              {formData.symbol || "tokens"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Decimals:</span>
            <span className="font-semibold text-gray-800">
              {formData.decimals}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Network:</span>
            <span className="font-semibold text-gray-800">Stellar Testnet</span>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex space-x-4">
        <Button type="submit" loading={loading} fullWidth size="lg">
          {loading ? "Creating Token..." : "Create Token"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate("/")}
          disabled={loading}
          fullWidth
          size="lg"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
