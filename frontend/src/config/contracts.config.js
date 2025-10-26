export const CONTRACTS = {
  tokenFactory: import.meta.env.VITE_TOKEN_FACTORY_CONTRACT_ID,
  dex: import.meta.env.VITE_DEX_CONTRACT_ID, // ← Add this
};

export const validateContracts = () => {
  const missingContracts = [];

  if (!CONTRACTS.tokenFactory) {
    missingContracts.push("Token Factory");
  }

  if (!CONTRACTS.dex) {
    missingContracts.push("DEX");
  }

  return {
    isValid: missingContracts.length === 0,
    missing: missingContracts,
  };
};
