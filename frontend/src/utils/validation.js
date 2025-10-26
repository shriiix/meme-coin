// Amount validation
export const validateAmount = (amount) => {
  if (!amount || amount === "") {
    return "Amount is required";
  }

  const numAmount = parseFloat(amount);

  if (isNaN(numAmount)) {
    return "Invalid amount";
  }

  if (numAmount <= 0) {
    return "Amount must be greater than 0";
  }

  if (numAmount > 1000000000) {
    return "Amount is too large";
  }

  return null;
};

// Price validation
export const validatePrice = (price) => {
  if (!price || price === "") {
    return "Price is required";
  }

  const numPrice = parseFloat(price);

  if (isNaN(numPrice)) {
    return "Invalid price";
  }

  if (numPrice <= 0) {
    return "Price must be greater than 0";
  }

  if (numPrice > 1000000) {
    return "Price is too high";
  }

  return null;
};

// Token name validation
export const validateTokenName = (name) => {
  if (!name || name.trim() === "") {
    return "Token name is required";
  }

  if (name.length < 3) {
    return "Token name must be at least 3 characters";
  }

  if (name.length > 32) {
    return "Token name must be less than 32 characters";
  }

  // Only allow letters, numbers, spaces
  if (!/^[a-zA-Z0-9\s]+$/.test(name)) {
    return "Token name can only contain letters, numbers, and spaces";
  }

  return null;
};

// Token symbol validation
export const validateSymbol = (symbol) => {
  if (!symbol || symbol.trim() === "") {
    return "Token symbol is required";
  }

  if (symbol.length < 2) {
    return "Symbol must be at least 2 characters";
  }

  if (symbol.length > 12) {
    return "Symbol must be less than 12 characters";
  }

  // Only allow uppercase letters and numbers
  if (!/^[A-Z0-9]+$/.test(symbol)) {
    return "Symbol must be uppercase letters and numbers only";
  }

  return null;
};

// Decimals validation
export const validateDecimals = (decimals) => {
  if (decimals === "" || decimals === null || decimals === undefined) {
    return "Decimals is required";
  }

  const numDecimals = parseInt(decimals);

  if (isNaN(numDecimals)) {
    return "Invalid decimals value";
  }

  if (numDecimals < 0) {
    return "Decimals cannot be negative";
  }

  if (numDecimals > 18) {
    return "Decimals cannot exceed 18";
  }

  return null;
};

// Initial supply validation
export const validateInitialSupply = (supply) => {
  if (!supply || supply === "") {
    return "Initial supply is required";
  }

  const numSupply = parseFloat(supply);

  if (isNaN(numSupply)) {
    return "Invalid supply value";
  }

  if (numSupply <= 0) {
    return "Supply must be greater than 0";
  }

  if (numSupply > Number.MAX_SAFE_INTEGER) {
    return "Supply is too large";
  }

  return null;
};

// Stellar address validation
export const validateAddress = (address) => {
  if (!address || address === "") {
    return "Address is required";
  }

  // Stellar public keys start with G and are 56 characters
  // Stellar contract addresses start with C and are 56 characters
  if (
    (!address.startsWith("G") && !address.startsWith("C")) ||
    address.length !== 56
  ) {
    return "Invalid Stellar address";
  }

  return null;
};

// Contract ID validation
export const validateContractId = (contractId) => {
  if (!contractId || contractId === "") {
    return "Contract ID is required";
  }

  // Contract addresses start with C and are 56 characters
  if (!contractId.startsWith("C") || contractId.length !== 56) {
    return "Invalid contract ID";
  }

  return null;
};

// Generic number validation
export const validateNumber = (
  value,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  fieldName = "Value"
) => {
  if (value === "" || value === null || value === undefined) {
    return `${fieldName} is required`;
  }

  const numValue = parseFloat(value);

  if (isNaN(numValue)) {
    return `Invalid ${fieldName.toLowerCase()}`;
  }

  if (numValue < min) {
    return `${fieldName} must be at least ${min}`;
  }

  if (numValue > max) {
    return `${fieldName} cannot exceed ${max}`;
  }

  return null;
};

// String length validation
export const validateStringLength = (
  value,
  minLength,
  maxLength,
  fieldName = "Field"
) => {
  if (!value || value.trim() === "") {
    return `${fieldName} is required`;
  }

  if (value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }

  if (value.length > maxLength) {
    return `${fieldName} must be less than ${maxLength} characters`;
  }

  return null;
};

// Email validation (if needed for future features)
export const validateEmail = (email) => {
  if (!email || email.trim() === "") {
    return "Email is required";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Invalid email format";
  }

  return null;
};

// URL validation (for token metadata)
export const validateUrl = (url) => {
  if (!url || url.trim() === "") {
    return null; // URL is optional
  }

  try {
    new URL(url);
    return null;
  } catch {
    return "Invalid URL format";
  }
};
