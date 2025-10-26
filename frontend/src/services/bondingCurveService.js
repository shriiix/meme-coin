import * as StellarSdk from "stellar-sdk";
import { StellarService } from "./stellarService";
import { CONTRACTS } from "../config/contracts.config";
import { STELLAR_CONFIG } from "../config/stellar.config";

export class BondingCurveService extends StellarService {
  constructor(walletKit, publicKey) {
    super(walletKit, publicKey);
    this.contractId = CONTRACTS.bondingCurve;
  }

  extractSimulationResult(simulation) {
    try {
      if (simulation.results?.[0]?.retval) {
        return StellarSdk.scValToNative(simulation.results[0].retval);
      }
      if (simulation.result?.retval) {
        return StellarSdk.scValToNative(simulation.result.retval);
      }
      if (simulation.retval) {
        return StellarSdk.scValToNative(simulation.retval);
      }
      if (simulation.returnValue) {
        return StellarSdk.scValToNative(simulation.returnValue);
      }
      return null;
    } catch (error) {
      console.error("Error extracting result:", error);
      return null;
    }
  }

  async createToken(name, symbol, totalSupply) {
    try {
      console.log("🪙 Creating bonding curve token...", {
        name,
        symbol,
        totalSupply,
      });

      const params = [
        new StellarSdk.Address(this.publicKey).toScVal(),
        StellarSdk.nativeToScVal(name, { type: "string" }),
        StellarSdk.nativeToScVal(symbol, { type: "string" }),
        StellarSdk.nativeToScVal(parseInt(totalSupply), { type: "i128" }),
      ];

      const result = await this.invokeContract(
        this.contractId,
        "create_token",
        params
      );

      console.log("✅ Token created:", result);
      return result;
    } catch (error) {
      console.error("Token creation failed:", error);
      throw error;
    }
  }

  async calculateBuy(tokenId, xlmAmount) {
    try {
      const contract = new StellarSdk.Contract(this.contractId);
      const sourceAccount = await this.server.getAccount(this.publicKey);

      const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: "100000",
        networkPassphrase: STELLAR_CONFIG.networkPassphrase,
      })
        .addOperation(
          contract.call(
            "calculate_buy",
            StellarSdk.nativeToScVal(tokenId, { type: "u64" }),
            StellarSdk.nativeToScVal(parseInt(xlmAmount), { type: "i128" })
          )
        )
        .setTimeout(30)
        .build();

      const simulation = await this.server.simulateTransaction(tx);
      const tokens = this.extractSimulationResult(simulation);

      return typeof tokens === "bigint" ? Number(tokens) : tokens || 0;
    } catch (error) {
      console.error("Calculate buy failed:", error);
      return 0;
    }
  }

  async calculateSell(tokenId, tokenAmount) {
    try {
      const contract = new StellarSdk.Contract(this.contractId);
      const sourceAccount = await this.server.getAccount(this.publicKey);

      const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: "100000",
        networkPassphrase: STELLAR_CONFIG.networkPassphrase,
      })
        .addOperation(
          contract.call(
            "calculate_sell",
            StellarSdk.nativeToScVal(tokenId, { type: "u64" }),
            StellarSdk.nativeToScVal(parseInt(tokenAmount), { type: "i128" })
          )
        )
        .setTimeout(30)
        .build();

      const simulation = await this.server.simulateTransaction(tx);
      const xlm = this.extractSimulationResult(simulation);

      return typeof xlm === "bigint" ? Number(xlm) : xlm || 0;
    } catch (error) {
      console.error("Calculate sell failed:", error);
      return 0;
    }
  }

  async buy(tokenId, xlmAmount) {
    try {
      console.log("💰 Buying tokens...", { tokenId, xlmAmount });

      const params = [
        new StellarSdk.Address(this.publicKey).toScVal(),
        StellarSdk.nativeToScVal(tokenId, { type: "u64" }),
        StellarSdk.nativeToScVal(parseInt(xlmAmount), { type: "i128" }),
      ];

      const result = await this.invokeContract(this.contractId, "buy", params);

      console.log("✅ Purchase successful:", result);
      return result;
    } catch (error) {
      console.error("Buy failed:", error);
      throw error;
    }
  }

  async sell(tokenId, tokenAmount) {
    try {
      console.log("💸 Selling tokens...", { tokenId, tokenAmount });

      const params = [
        new StellarSdk.Address(this.publicKey).toScVal(),
        StellarSdk.nativeToScVal(tokenId, { type: "u64" }),
        StellarSdk.nativeToScVal(parseInt(tokenAmount), { type: "i128" }),
      ];

      const result = await this.invokeContract(this.contractId, "sell", params);

      console.log("✅ Sale successful:", result);
      return result;
    } catch (error) {
      console.error("Sell failed:", error);
      throw error;
    }
  }

  async getPrice(tokenId) {
    try {
      const contract = new StellarSdk.Contract(this.contractId);
      const sourceAccount = await this.server.getAccount(this.publicKey);

      const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: "100000",
        networkPassphrase: STELLAR_CONFIG.networkPassphrase,
      })
        .addOperation(
          contract.call(
            "get_price",
            StellarSdk.nativeToScVal(tokenId, { type: "u64" })
          )
        )
        .setTimeout(30)
        .build();

      const simulation = await this.server.simulateTransaction(tx);
      const price = this.extractSimulationResult(simulation);

      return typeof price === "bigint" ? Number(price) : price || 0;
    } catch (error) {
      console.error("Get price failed:", error);
      return 0;
    }
  }

  async getMarketCap(tokenId) {
    try {
      const contract = new StellarSdk.Contract(this.contractId);
      const sourceAccount = await this.server.getAccount(this.publicKey);

      const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: "100000",
        networkPassphrase: STELLAR_CONFIG.networkPassphrase,
      })
        .addOperation(
          contract.call(
            "get_market_cap",
            StellarSdk.nativeToScVal(tokenId, { type: "u64" })
          )
        )
        .setTimeout(30)
        .build();

      const simulation = await this.server.simulateTransaction(tx);
      const marketCap = this.extractSimulationResult(simulation);

      return typeof marketCap === "bigint" ? Number(marketCap) : marketCap || 0;
    } catch (error) {
      console.error("Get market cap failed:", error);
      return 0;
    }
  }

  async getTokenInfo(tokenId) {
    try {
      const contract = new StellarSdk.Contract(this.contractId);
      const sourceAccount = await this.server.getAccount(this.publicKey);

      const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: "100000",
        networkPassphrase: STELLAR_CONFIG.networkPassphrase,
      })
        .addOperation(
          contract.call(
            "get_token_info",
            StellarSdk.nativeToScVal(tokenId, { type: "u64" })
          )
        )
        .setTimeout(30)
        .build();

      const simulation = await this.server.simulateTransaction(tx);
      const info = this.extractSimulationResult(simulation);

      if (!info) return null;

      return {
        token_id:
          typeof info.token_id === "bigint"
            ? Number(info.token_id)
            : info.token_id,
        name: info.name,
        symbol: info.symbol,
        total_supply:
          typeof info.total_supply === "bigint"
            ? Number(info.total_supply)
            : info.total_supply,
        current_supply:
          typeof info.current_supply === "bigint"
            ? Number(info.current_supply)
            : info.current_supply,
        virtual_xlm_reserve:
          typeof info.virtual_xlm_reserve === "bigint"
            ? Number(info.virtual_xlm_reserve)
            : info.virtual_xlm_reserve,
        virtual_token_reserve:
          typeof info.virtual_token_reserve === "bigint"
            ? Number(info.virtual_token_reserve)
            : info.virtual_token_reserve,
        creator: info.creator,
        created_at:
          typeof info.created_at === "bigint"
            ? Number(info.created_at)
            : info.created_at,
      };
    } catch (error) {
      console.error("Get token info failed:", error);
      return null;
    }
  }

  async getTokenCount() {
    try {
      const contract = new StellarSdk.Contract(this.contractId);
      const sourceAccount = await this.server.getAccount(this.publicKey);

      const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: "100000",
        networkPassphrase: STELLAR_CONFIG.networkPassphrase,
      })
        .addOperation(contract.call("get_token_count"))
        .setTimeout(30)
        .build();

      const simulation = await this.server.simulateTransaction(tx);
      const count = this.extractSimulationResult(simulation);

      return typeof count === "bigint" ? Number(count) : count || 0;
    } catch (error) {
      console.error("Get token count failed:", error);
      return 0;
    }
  }

  async getAllTokens() {
    try {
      const count = await this.getTokenCount();
      console.log(`📊 Fetching ${count} tokens...`);

      if (count === 0) return [];

      const tokens = [];
      for (let i = 1; i <= count; i++) {
        const token = await this.getTokenInfo(i);
        if (token) {
          // Get current price and market cap
          const price = await this.getPrice(i);
          const marketCap = await this.getMarketCap(i);

          tokens.push({
            ...token,
            price,
            market_cap: marketCap,
          });
        }
      }

      console.log(`✅ Fetched ${tokens.length} tokens`);
      return tokens;
    } catch (error) {
      console.error("Failed to get all tokens:", error);
      return [];
    }
  }
}
