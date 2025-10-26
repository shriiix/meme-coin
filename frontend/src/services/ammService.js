import * as StellarSdk from "stellar-sdk";
import { StellarService } from "./stellarService";
import { CONTRACTS } from "../config/contracts.config";
import { STELLAR_CONFIG } from "../config/stellar.config";

export class AMMService extends StellarService {
  constructor(walletKit, publicKey) {
    super(walletKit, publicKey);
    this.contractId = CONTRACTS.amm;
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
      return null;
    } catch (error) {
      console.error("Extract result error:", error);
      return null;
    }
  }

  async createPool(name, symbol, totalSupply, initialXLM) {
    try {
      console.log("🏊 Creating AMM pool...", {
        name,
        symbol,
        totalSupply,
        initialXLM,
      });

      const params = [
        new StellarSdk.Address(this.publicKey).toScVal(),
        StellarSdk.nativeToScVal(name, { type: "string" }),
        StellarSdk.nativeToScVal(symbol, { type: "string" }),
        StellarSdk.nativeToScVal(parseInt(totalSupply), { type: "i128" }),
        StellarSdk.nativeToScVal(parseInt(initialXLM), { type: "i128" }),
      ];

      const result = await this.invokeContract(
        this.contractId,
        "create_pool",
        params
      );

      console.log("✅ Pool created:", result);
      return result;
    } catch (error) {
      console.error("Create pool failed:", error);
      throw error;
    }
  }

  async swapXLMForTokens(poolId, xlmAmount, minTokensOut) {
    try {
      console.log("💱 Swapping XLM for tokens...", {
        poolId,
        xlmAmount,
        minTokensOut,
      });

      const params = [
        new StellarSdk.Address(this.publicKey).toScVal(),
        StellarSdk.nativeToScVal(poolId, { type: "u64" }),
        StellarSdk.nativeToScVal(parseInt(xlmAmount), { type: "i128" }),
        StellarSdk.nativeToScVal(parseInt(minTokensOut), { type: "i128" }),
      ];

      const result = await this.invokeContract(
        this.contractId,
        "swap_xlm_for_tokens",
        params
      );

      console.log("✅ Swap successful:", result);
      return result;
    } catch (error) {
      console.error("Swap failed:", error);
      throw error;
    }
  }

  async swapTokensForXLM(poolId, tokenAmount, minXLMOut) {
    try {
      console.log("💱 Swapping tokens for XLM...", {
        poolId,
        tokenAmount,
        minXLMOut,
      });

      const params = [
        new StellarSdk.Address(this.publicKey).toScVal(),
        StellarSdk.nativeToScVal(poolId, { type: "u64" }),
        StellarSdk.nativeToScVal(parseInt(tokenAmount), { type: "i128" }),
        StellarSdk.nativeToScVal(parseInt(minXLMOut), { type: "i128" }),
      ];

      const result = await this.invokeContract(
        this.contractId,
        "swap_tokens_for_xlm",
        params
      );

      console.log("✅ Swap successful:", result);
      return result;
    } catch (error) {
      console.error("Swap failed:", error);
      throw error;
    }
  }

  async quoteSwapXLMToTokens(poolId, xlmAmount) {
    try {
      const contract = new StellarSdk.Contract(this.contractId);
      const sourceAccount = await this.server.getAccount(this.publicKey);

      const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: "100000",
        networkPassphrase: STELLAR_CONFIG.networkPassphrase,
      })
        .addOperation(
          contract.call(
            "quote_swap_xlm_to_tokens",
            StellarSdk.nativeToScVal(poolId, { type: "u64" }),
            StellarSdk.nativeToScVal(parseInt(xlmAmount), { type: "i128" })
          )
        )
        .setTimeout(30)
        .build();

      const simulation = await this.server.simulateTransaction(tx);
      const tokens = this.extractSimulationResult(simulation);

      return typeof tokens === "bigint" ? Number(tokens) : tokens || 0;
    } catch (error) {
      console.error("Quote failed:", error);
      return 0;
    }
  }

  async quoteSwapTokensToXLM(poolId, tokenAmount) {
    try {
      const contract = new StellarSdk.Contract(this.contractId);
      const sourceAccount = await this.server.getAccount(this.publicKey);

      const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: "100000",
        networkPassphrase: STELLAR_CONFIG.networkPassphrase,
      })
        .addOperation(
          contract.call(
            "quote_swap_tokens_to_xlm",
            StellarSdk.nativeToScVal(poolId, { type: "u64" }),
            StellarSdk.nativeToScVal(parseInt(tokenAmount), { type: "i128" })
          )
        )
        .setTimeout(30)
        .build();

      const simulation = await this.server.simulateTransaction(tx);
      const xlm = this.extractSimulationResult(simulation);

      return typeof xlm === "bigint" ? Number(xlm) : xlm || 0;
    } catch (error) {
      console.error("Quote failed:", error);
      return 0;
    }
  }

  async getPrice(poolId) {
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
            StellarSdk.nativeToScVal(poolId, { type: "u64" })
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

  async getPool(poolId) {
    try {
      const contract = new StellarSdk.Contract(this.contractId);
      const sourceAccount = await this.server.getAccount(this.publicKey);

      const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: "100000",
        networkPassphrase: STELLAR_CONFIG.networkPassphrase,
      })
        .addOperation(
          contract.call(
            "get_pool",
            StellarSdk.nativeToScVal(poolId, { type: "u64" })
          )
        )
        .setTimeout(30)
        .build();

      const simulation = await this.server.simulateTransaction(tx);
      const pool = this.extractSimulationResult(simulation);

      if (!pool) return null;

      return {
        pool_id:
          typeof pool.pool_id === "bigint"
            ? Number(pool.pool_id)
            : pool.pool_id,
        token_name: pool.token_name,
        token_symbol: pool.token_symbol,
        token_reserve:
          typeof pool.token_reserve === "bigint"
            ? Number(pool.token_reserve)
            : pool.token_reserve,
        xlm_reserve:
          typeof pool.xlm_reserve === "bigint"
            ? Number(pool.xlm_reserve)
            : pool.xlm_reserve,
        total_supply:
          typeof pool.total_supply === "bigint"
            ? Number(pool.total_supply)
            : pool.total_supply,
        creator: pool.creator,
        created_at:
          typeof pool.created_at === "bigint"
            ? Number(pool.created_at)
            : pool.created_at,
        lp_tokens:
          typeof pool.lp_tokens === "bigint"
            ? Number(pool.lp_tokens)
            : pool.lp_tokens,
      };
    } catch (error) {
      console.error("Get pool failed:", error);
      return null;
    }
  }

  async getPoolCount() {
    try {
      const contract = new StellarSdk.Contract(this.contractId);
      const sourceAccount = await this.server.getAccount(this.publicKey);

      const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: "100000",
        networkPassphrase: STELLAR_CONFIG.networkPassphrase,
      })
        .addOperation(contract.call("get_pool_count"))
        .setTimeout(30)
        .build();

      const simulation = await this.server.simulateTransaction(tx);
      const count = this.extractSimulationResult(simulation);

      return typeof count === "bigint" ? Number(count) : count || 0;
    } catch (error) {
      console.error("Get pool count failed:", error);
      return 0;
    }
  }

  async getMarketCap(poolId) {
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
            StellarSdk.nativeToScVal(poolId, { type: "u64" })
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

  async getAllPools() {
    try {
      const count = await this.getPoolCount();
      console.log(`📊 Total pools: ${count}`);

      if (count === 0) return [];

      const pools = [];
      for (let i = 1; i <= count; i++) {
        const pool = await this.getPool(i);
        if (pool) {
          const price = await this.getPrice(i);
          const marketCap = await this.getMarketCap(i);

          pools.push({
            ...pool,
            price,
            market_cap: marketCap,
          });
        }
      }

      console.log(`✅ Fetched ${pools.length} pools`);
      return pools;
    } catch (error) {
      console.error("Get all pools failed:", error);
      return [];
    }
  }
}
