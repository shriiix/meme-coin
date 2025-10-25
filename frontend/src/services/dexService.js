import * as StellarSdk from "stellar-sdk";
import { StellarService } from "./stellarService";
import { CONTRACTS } from "../config/contracts.config";
import { xlmToSroops } from "../utils/formatting";

export class DEXService extends StellarService {
  constructor(walletKit, publicKey) {
    super(walletKit, publicKey);
    this.contractId = CONTRACTS.dex;
  }

  async createSellOrder(tokenAddress, amount, price) {
    if (!this.contractId) {
      throw new Error("DEX contract not configured");
    }

    const params = [
      StellarSdk.Address.fromString(this.publicKey).toScVal(),
      StellarSdk.Address.fromString(tokenAddress).toScVal(),
      StellarSdk.nativeToScVal(xlmToSroops(amount), { type: "i128" }),
      StellarSdk.nativeToScVal(xlmToSroops(price), { type: "i128" }),
    ];

    const result = await this.invokeContract(
      this.contractId,
      "create_sell_order",
      params
    );

    return result;
  }

  async buyTokens(orderId) {
    if (!this.contractId) {
      throw new Error("DEX contract not configured");
    }

    const params = [
      StellarSdk.Address.fromString(this.publicKey).toScVal(),
      StellarSdk.nativeToScVal(orderId, { type: "u64" }),
    ];

    const result = await this.invokeContract(
      this.contractId,
      "buy_tokens",
      params
    );
    return result;
  }

  async getOrder(orderId) {
    if (!this.contractId) {
      throw new Error("DEX contract not configured");
    }

    try {
      const params = [StellarSdk.nativeToScVal(orderId, { type: "u64" })];
      const order = await this.simulateContract(
        this.contractId,
        "get_order",
        params
      );
      return order;
    } catch (error) {
      console.error("Failed to get order:", error);
      return null;
    }
  }

  async cancelOrder(orderId) {
    if (!this.contractId) {
      throw new Error("DEX contract not configured");
    }

    const params = [
      StellarSdk.Address.fromString(this.publicKey).toScVal(),
      StellarSdk.nativeToScVal(orderId, { type: "u64" }),
    ];

    const result = await this.invokeContract(
      this.contractId,
      "cancel_order",
      params
    );

    return result;
  }
}
