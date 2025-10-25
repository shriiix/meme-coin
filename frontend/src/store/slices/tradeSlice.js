export const createTradeSlice = (set, get) => ({
  orders: [],
  tradeHistory: [],
  loading: false,

  setOrders: (orders) => set({ orders }),
  setTradeHistory: (history) => set({ tradeHistory: history }),
  setLoading: (loading) => set({ loading }),

  addOrder: (order) =>
    set((state) => ({
      orders: [order, ...state.orders],
    })),

  removeOrder: (orderId) =>
    set((state) => ({
      orders: state.orders.filter((o) => o.id !== orderId),
    })),
});
