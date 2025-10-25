export const validateTokenName = (name) => {
  if (!name || name.trim().length === 0) {
    return "Token name is required";
  }
  if (name.length < 3) {
    return "Token name must be at least 3 characters";
  }
  if (name.length > 50) {
    return "Token name must be less than 50 characters";
  }
  return null;
};

export const validateTokenSymbol = (symbol) => {
  if (!symbol || symbol.trim().length === 0) {
    return "Token symbol is required";
  }
  if (symbol.length < 2) {
    return "Token symbol must be at least 2 characters";
  }
  if (symbol.length > 12) {
    return "Token symbol must be less than 12 characters";
  }
  if (!/^[A-Z0-9]+$/.test(symbol)) {
    return "Token symbol must contain only uppercase letters and numbers";
  }
  return null;
};

export const validateTokenSupply = (supply, min = 1, max = 1000000000000) => {
  const numSupply = Number(supply);

  if (isNaN(numSupply)) {
    return "Supply must be a valid number";
  }
  if (numSupply < min) {
    return `Supply must be at least ${min}`;
  }
  if (numSupply > max) {
    return `Supply must be less than ${max}`;
  }
  return null;
};

export const validateAmount = (amount) => {
  const numAmount = Number(amount);

  if (isNaN(numAmount)) {
    return "Amount must be a valid number";
  }
  if (numAmount <= 0) {
    return "Amount must be greater than 0";
  }
  return null;
};

export const validatePrice = (price) => {
  const numPrice = Number(price);

  if (isNaN(numPrice)) {
    return "Price must be a valid number";
  }
  if (numPrice <= 0) {
    return "Price must be greater than 0";
  }
  return null;
};
