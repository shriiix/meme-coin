export const STELLAR_CONFIG = {
  network: import.meta.env.VITE_STELLAR_NETWORK || "TESTNET",
  horizonUrl:
    import.meta.env.VITE_HORIZON_URL || "https://horizon-testnet.stellar.org",
  sorobanRpcUrl:
    import.meta.env.VITE_SOROBAN_RPC_URL ||
    "https://soroban-testnet.stellar.org",
  networkPassphrase:
    import.meta.env.VITE_NETWORK_PASSPHRASE ||
    "Test SDF Network ; September 2015",
};

export const CONTRACTS = {
  tokenFactory: import.meta.env.VITE_TOKEN_FACTORY_CONTRACT_ID || "",
  dex: import.meta.env.VITE_DEX_CONTRACT_ID || "",
};
