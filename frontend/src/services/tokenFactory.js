import * as StellarSdk from "stellar-sdk";
import { StellarService } from "./stellarService";
import { CONTRACTS } from "../config/contracts.config";
import { xlmToSroops } from "../utils/formatting";

export class TokenFactoryService extends StellarService {
  constructor(walletKit, publicKey) {
    super(walletKit, publicKey);
    this.contractId = CONTRACTS.tokenFactory;
  }

  async createToken(name, symbol, decimals, initialSupply) {
    if (!this.contractId) {
      throw new Error("Token Factory contract not configured");
    }

    const params = [
      StellarSdk.Address.fromString(this.publicKey).toScVal(),
      StellarSdk.nativeToScVal(name, { type: "string" }),
      StellarSdk.nativeToScVal(symbol, { type: "string" }),
      StellarSdk.nativeToScVal(decimals, { type: "u32" }),
      StellarSdk.nativeToScVal(xlmToSroops(initialSupply), { type: "i128" }),
    ];

    const result = await this.invokeContract(
      this.contractId,
      "create_token",
      params
    );

    return result;
  }

  async getTokenCount() {
    if (!this.contractId) {
      throw new Error("Token Factory contract not configured");
    }

    try {
      const count = await this.simulateContract(
        this.contractId,
        "get_token_count",
        []
      );
      return count || 0;
    } catch (error) {
      console.error("Failed to get token count:", error);
      return 0;
    }
  }

  async getTokenInfo(tokenId) {
    if (!this.contractId) {
      throw new Error("Token Factory contract not configured");
    }

    try {
      const params = [StellarSdk.nativeToScVal(tokenId, { type: "u32" })];
      const info = await this.simulateContract(
        this.contractId,
        "get_token_info",
        params
      );
      return info;
    } catch (error) {
      console.error("Failed to get token info:", error);
      return null;
    }
  }

  async getAllTokens() {
    try {
      const count = await this.getTokenCount();
      const tokens = [];

      for (let i = 1; i <= count; i++) {
        const tokenInfo = await this.getTokenInfo(i);
        if (tokenInfo) {
          tokens.push({
            id: i,
            ...tokenInfo,
          });
        }
      }

      return tokens;
    } catch (error) {
      console.error("Failed to get all tokens:", error);
      return [];
    }
  }

  async getCreatorTokens(creatorAddress) {
    if (!this.contractId) {
      throw new Error("Token Factory contract not configured");
    }

    try {
      const params = [StellarSdk.Address.fromString(creatorAddress).toScVal()];
      const tokenIds = await this.simulateContract(
        this.contractId,
        "get_creator_tokens",
        params
      );

      if (!tokenIds || tokenIds.length === 0) {
        return [];
      }

      const tokens = [];
      for (const id of tokenIds) {
        const info = await this.getTokenInfo(id);
        if (info) {
          tokens.push({ id, ...info });
        }
      }

      return tokens;
    } catch (error) {
      console.error("Failed to get creator tokens:", error);
      return [];
    }
  }
}
