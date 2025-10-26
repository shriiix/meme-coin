import React, { useState } from "react";
import {
  validateTokenName,
  validateSymbol,
  validateDecimals,
  validateInitialSupply,
} from "../../utils/validation";
import Input from "../common/Input";
import Button from "../common/Button";

export default function TokenForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    decimals: "7",
    initialSupply: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Auto-uppercase symbol
    const finalValue = name === "symbol" ? value.toUpperCase() : value;

    setFormData((prev) => ({ ...prev, [name]: finalValue }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    const nameError = validateTokenName(formData.name);
    if (nameError) newErrors.name = nameError;

    const symbolError = validateSymbol(formData.symbol);
    if (symbolError) newErrors.symbol = symbolError;

    const decimalsError = validateDecimals(formData.decimals);
    if (decimalsError) newErrors.decimals = decimalsError;

    const supplyError = validateInitialSupply(formData.initialSupply);
    if (supplyError) newErrors.initialSupply = supplyError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    // Convert to proper types
    const data = {
      name: formData.name.trim(),
      symbol: formData.symbol.trim().toUpperCase(),
      decimals: parseInt(formData.decimals),
      initialSupply: parseFloat(formData.initialSupply),
    };

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Token Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="My Awesome Token"
        error={errors.name}
        helperText="The full name of your token (3-32 characters)"
        required
      />

      <Input
        label="Symbol"
        name="symbol"
        value={formData.symbol}
        onChange={handleChange}
        placeholder="MAT"
        error={errors.symbol}
        helperText="Trading symbol (2-12 uppercase characters)"
        required
        maxLength={12}
      />

      <Input
        label="Decimals"
        name="decimals"
        type="number"
        value={formData.decimals}
        onChange={handleChange}
        error={errors.decimals}
        helperText="Number of decimal places (typically 7 for Stellar)"
        min="0"
        max="18"
        required
      />

      <Input
        label="Initial Supply"
        name="initialSupply"
        type="number"
        value={formData.initialSupply}
        onChange={handleChange}
        placeholder="1000000"
        error={errors.initialSupply}
        helperText="Total number of tokens to create"
        step="any"
        required
      />

      {/* Preview */}
      {formData.name && formData.symbol && (
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Preview:</p>
          <p className="text-lg font-bold text-purple-700">
            {formData.name} ({formData.symbol})
          </p>
          {formData.initialSupply && formData.decimals && (
            <p className="text-sm text-gray-700 mt-1">
              Supply: {parseFloat(formData.initialSupply).toLocaleString()}{" "}
              tokens
            </p>
          )}
        </div>
      )}

      <Button type="submit" loading={loading} fullWidth size="lg">
        {loading ? "Creating Token..." : "Create Token"}
      </Button>
    </form>
  );
}
