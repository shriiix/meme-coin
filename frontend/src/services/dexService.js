import * as StellarSdk from "stellar-sdk";
import { StellarService } from "./stellarService";
import { CONTRACTS } from "../config/contracts.config";
import { STELLAR_CONFIG } from "../config/stellar.config";

export class DEXService extends StellarService {
  constructor(walletKit, publicKey) {
    super(walletKit, publicKey);
    this.contractId = CONTRACTS.dex;
  }

  /**
   * Extract return value from simulation response
   */
  extractSimulationResult(simulation) {
    try {
      console.log("🔍 Parsing simulation response...");

      if (simulation.results && simulation.results[0]?.retval) {
        console.log("✅ Found result in results[0].retval");
        return StellarSdk.scValToNative(simulation.results[0].retval);
      }

      if (simulation.result?.retval) {
        console.log("✅ Found result in result.retval");
        return StellarSdk.scValToNative(simulation.result.retval);
      }

      if (simulation.retval) {
        console.log("✅ Found result in retval");
        return StellarSdk.scValToNative(simulation.retval);
      }

      if (simulation.returnValue) {
        console.log("✅ Found result in returnValue");
        return StellarSdk.scValToNative(simulation.returnValue);
      }

      console.warn("⚠️ No return value found");
      return null;
    } catch (error) {
      console.error("Error extracting simulation result:", error);
      return null;
    }
  }

  async createSellOrder(tokenContractId, amount, pricePerToken) {
    if (!this.contractId) {
      throw new Error("DEX contract not configured");
    }

    try {
      console.log("📝 Creating sell order...", {
        tokenContractId,
        amount,
        pricePerToken,
      });

      const params = [
        new StellarSdk.Address(this.publicKey).toScVal(),
        new StellarSdk.Address(tokenContractId).toScVal(),
        StellarSdk.nativeToScVal(parseInt(amount), { type: "i128" }),
        StellarSdk.nativeToScVal(parseInt(pricePerToken), { type: "i128" }),
      ];

      const result = await this.invokeContract(
        this.contractId,
        "create_sell_order",
        params
      );

      console.log("✅ Sell order created:", result);
      return result;
    } catch (error) {
      console.error("Failed to create sell order:", error);
      throw new Error(error.message || "Failed to create sell order");
    }
  }

  async buyTokens(orderId, amount) {
    if (!this.contractId) {
      throw new Error("DEX contract not configured");
    }

    try {
      console.log("💰 Buying tokens...", { orderId, amount });

      const params = [
        new StellarSdk.Address(this.publicKey).toScVal(),
        StellarSdk.nativeToScVal(orderId, { type: "u64" }),
        StellarSdk.nativeToScVal(parseInt(amount), { type: "i128" }),
      ];

      const result = await this.invokeContract(
        this.contractId,
        "buy_tokens",
        params
      );

      console.log("✅ Tokens purchased:", result);
      return result;
    } catch (error) {
      console.error("Failed to buy tokens:", error);
      throw new Error(error.message || "Failed to buy tokens");
    }
  }

  async cancelOrder(orderId) {
    if (!this.contractId) {
      throw new Error("DEX contract not configured");
    }

    try {
      console.log("❌ Canceling order...", { orderId });

      const params = [
        new StellarSdk.Address(this.publicKey).toScVal(),
        StellarSdk.nativeToScVal(orderId, { type: "u64" }),
      ];

      const result = await this.invokeContract(
        this.contractId,
        "cancel_order",
        params
      );

      console.log("✅ Order canceled:", result);
      return result;
    } catch (error) {
      console.error("Failed to cancel order:", error);
      throw new Error(error.message || "Failed to cancel order");
    }
  }

  async getTokenOrders(tokenContractId) {
    if (!this.contractId) {
      return [];
    }

    try {
      console.log("📊 Fetching orders for token:", tokenContractId);

      const contract = new StellarSdk.Contract(this.contractId);
      const sourceAccount = await this.server.getAccount(this.publicKey);

      const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: "100000",
        networkPassphrase: STELLAR_CONFIG.networkPassphrase,
      })
        .addOperation(
          contract.call(
            "get_token_orders",
            new StellarSdk.Address(tokenContractId).toScVal()
          )
        )
        .setTimeout(30)
        .build();

      const simulation = await this.server.simulateTransaction(tx);
      const orders = this.extractSimulationResult(simulation);

      if (!orders || !Array.isArray(orders)) {
        console.log("No orders found");
        return [];
      }

      console.log(`✅ Found ${orders.length} orders`);
      return orders.map((order) => ({
        order_id:
          typeof order.order_id === "bigint"
            ? Number(order.order_id)
            : order.order_id,
        seller: order.seller,
        token_contract: order.token_contract,
        amount: order.amount,
        price_per_token: order.price_per_token,
        created_at: order.created_at,
        is_active: order.is_active !== false,
      }));
    } catch (error) {
      console.error("Failed to get token orders:", error);
      return [];
    }
  }

  async getUserOrders(userAddress) {
    if (!this.contractId) {
      return [];
    }

    try {
      const contract = new StellarSdk.Contract(this.contractId);
      const sourceAccount = await this.server.getAccount(this.publicKey);

      const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: "100000",
        networkPassphrase: STELLAR_CONFIG.networkPassphrase,
      })
        .addOperation(
          contract.call(
            "get_user_orders",
            new StellarSdk.Address(userAddress).toScVal()
          )
        )
        .setTimeout(30)
        .build();

      const simulation = await this.server.simulateTransaction(tx);
      const orders = this.extractSimulationResult(simulation);

      if (!orders || !Array.isArray(orders)) {
        return [];
      }

      return orders.map((order) => ({
        order_id:
          typeof order.order_id === "bigint"
            ? Number(order.order_id)
            : order.order_id,
        seller: order.seller,
        token_contract: order.token_contract,
        amount: order.amount,
        price_per_token: order.price_per_token,
        created_at: order.created_at,
        is_active: order.is_active !== false,
      }));
    } catch (error) {
      console.error("Failed to get user orders:", error);
      return [];
    }
  }
}
