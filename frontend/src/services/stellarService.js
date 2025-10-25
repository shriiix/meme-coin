import * as StellarSdk from "stellar-sdk";
import { STELLAR_CONFIG } from "../config/stellar.config";

export class StellarService {
  constructor(walletKit, publicKey) {
    this.kit = walletKit;
    this.publicKey = publicKey;
    this.server = new StellarSdk.rpc.Server(STELLAR_CONFIG.sorobanRpcUrl);
  }

  async invokeContract(contractId, method, params = []) {
    try {
      if (!this.kit) {
        throw new Error("Wallet not connected");
      }

      console.log("📤 Building transaction for:", method);

      const contract = new StellarSdk.Contract(contractId);
      const sourceAccount = await this.server.getAccount(this.publicKey);

      const builtTransaction = new StellarSdk.TransactionBuilder(
        sourceAccount,
        {
          fee: "100000",
          networkPassphrase: STELLAR_CONFIG.networkPassphrase,
        }
      )
        .addOperation(contract.call(method, ...params))
        .setTimeout(180)
        .build();

      console.log("🔧 Preparing transaction...");
      const preparedTransaction = await this.server.prepareTransaction(
        builtTransaction
      );

      console.log("✍️ Signing with wallet...");

      let signedXDR;
      if (window.freighterApi) {
        console.log("Using Freighter API directly");
        signedXDR = await window.freighterApi.signTransaction(
          preparedTransaction.toXDR(),
          { networkPassphrase: STELLAR_CONFIG.networkPassphrase }
        );
      } else if (this.kit) {
        console.log("Using Wallet Kit");
        const response = await this.kit.signTransaction(
          preparedTransaction.toXDR(),
          { networkPassphrase: STELLAR_CONFIG.networkPassphrase }
        );
        signedXDR = response.result || response.signedTxXdr || response;
      } else {
        throw new Error("No wallet available");
      }

      console.log("📨 Submitting to network...");
      const signedTx = new StellarSdk.Transaction(
        signedXDR,
        STELLAR_CONFIG.networkPassphrase
      );

      const response = await this.server.sendTransaction(signedTx);
      console.log("✅ Transaction submitted! Hash:", response.hash);

      return { hash: response.hash, status: "SUCCESS" };
    } catch (error) {
      console.error("❌ Transaction failed:", error);
      if (error.message?.includes("User declined")) {
        throw new Error("Transaction cancelled by user");
      }
      if (error.message?.includes("insufficient")) {
        throw new Error("Insufficient XLM balance");
      }
      throw new Error(error.message || "Transaction failed");
    }
  }

  async simulateContract(contractId, method, params = []) {
    try {
      console.log(`🔍 Simulating ${method}...`);

      const contract = new StellarSdk.Contract(contractId);
      const sourceAccount = await this.server.getAccount(this.publicKey);

      const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: "100000",
        networkPassphrase: STELLAR_CONFIG.networkPassphrase,
      })
        .addOperation(contract.call(method, ...params))
        .setTimeout(30)
        .build();

      console.log("📡 Sending simulation request...");
      const simulated = await this.server.simulateTransaction(transaction);

      console.log("Simulation response:", simulated);

      // Check for errors in simulation
      if (simulated.error) {
        console.error("Simulation error:", simulated.error);
        return null;
      }

      // Extract the result
      if (simulated.results && simulated.results.length > 0) {
        const result = simulated.results[0];

        if (result.retval) {
          const nativeValue = StellarSdk.scValToNative(result.retval);
          console.log(`✅ ${method} result:`, nativeValue);
          return nativeValue;
        }
      }

      // Try alternative result location
      if (simulated.result) {
        const nativeValue = StellarSdk.scValToNative(simulated.result);
        console.log(`✅ ${method} result (alt):`, nativeValue);
        return nativeValue;
      }

      console.warn(`⚠️ No result found in simulation for ${method}`);
      return null;
    } catch (error) {
      console.error(`❌ Simulation failed for ${method}:`, error);
      console.error("Error details:", {
        message: error.message,
        response: error.response,
      });
      return null;
    }
  }
}
