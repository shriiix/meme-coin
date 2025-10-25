export const createTokenSlice = (set, get) => ({
  tokens: [],
  selectedToken: null,
  loading: false,

  setTokens: (tokens) => set({ tokens }),
  setSelectedToken: (token) => set({ selectedToken: token }),
  setLoading: (loading) => set({ loading }),

  addToken: (token) =>
    set((state) => ({
      tokens: [token, ...state.tokens],
    })),

  updateToken: (tokenId, updates) =>
    set((state) => ({
      tokens: state.tokens.map((t) =>
        t.id === tokenId ? { ...t, ...updates } : t
      ),
    })),
});
