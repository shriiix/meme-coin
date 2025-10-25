import { create } from "zustand";
import { createWalletSlice } from "./slices/walletSlice";
import { createTokenSlice } from "./slices/tokenSlice";
import { createTradeSlice } from "./slices/tradeSlice";

export const useStore = create((...a) => ({
  ...createWalletSlice(...a),
  ...createTokenSlice(...a),
  ...createTradeSlice(...a),
}));
