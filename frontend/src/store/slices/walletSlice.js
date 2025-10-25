export const createWalletSlice = (set, get) => ({
  publicKey: null,
  isConnected: false,
  balance: 0,

  setPublicKey: (publicKey) => set({ publicKey }),
  setIsConnected: (isConnected) => set({ isConnected }),
  setBalance: (balance) => set({ balance }),

  reset: () =>
    set({
      publicKey: null,
      isConnected: false,
      balance: 0,
    }),
});
