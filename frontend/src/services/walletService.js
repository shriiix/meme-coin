import * as StellarSdk from "stellar-sdk";
import { STELLAR_CONFIG } from "../config/stellar.config";

export class WalletService {
  constructor(walletKit, publicKey) {
    this.walletKit = walletKit;
    this.publicKey = publicKey;
    this.horizonServer = new StellarSdk.Horizon.Server(
      STELLAR_CONFIG.horizonUrl
    );
  }

  async getXLMBalance() {
    try {
      const account = await this.horizonServer.loadAccount(this.publicKey);
      const xlmBalance = account.balances.find(
        (b) => b.asset_type === "native"
      );
      return xlmBalance ? parseFloat(xlmBalance.balance) : 0;
    } catch (error) {
      console.error("Failed to fetch XLM balance:", error);
      return 0;
    }
  }

  async getTokenBalance(tokenAddress) {
    try {
      const account = await this.horizonServer.loadAccount(this.publicKey);
      const tokenBalance = account.balances.find(
        (b) => b.asset_code && b.asset_issuer === tokenAddress
      );
      return tokenBalance ? parseFloat(tokenBalance.balance) : 0;
    } catch (error) {
      console.error("Failed to fetch token balance:", error);
      return 0;
    }
  }

  async getAllBalances() {
    try {
      const account = await this.horizonServer.loadAccount(this.publicKey);
      return account.balances.map((b) => ({
        asset: b.asset_type === "native" ? "XLM" : b.asset_code,
        balance: parseFloat(b.balance),
        issuer: b.asset_issuer || null,
      }));
    } catch (error) {
      console.error("Failed to fetch balances:", error);
      return [];
    }
  }
}
