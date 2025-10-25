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

      // Build transaction
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

      // Prepare for Soroban
      const preparedTransaction = await this.server.prepareTransaction(
        builtTransaction
      );

      console.log("✍️ Signing with wallet...");

      // Sign using wallet kit
      const signResponse = await this.kit.signTransaction(
        preparedTransaction.toXDR(),
        {
          networkPassphrase: STELLAR_CONFIG.networkPassphrase,
        }
      );

      console.log("📝 Sign response:", signResponse);

      // Extract signed XDR - handle different response formats
      let signedXDR;
      if (typeof signResponse === "string") {
        signedXDR = signResponse;
      } else if (signResponse.result) {
        signedXDR = signResponse.result;
      } else if (signResponse.signedTxXdr) {
        signedXDR = signResponse.signedTxXdr;
      } else {
        console.error("Unknown response format:", signResponse);
        throw new Error("Invalid sign response format");
      }

      console.log("📨 Submitting to network...");

      // Parse signed transaction - use Transaction instead of TransactionBuilder
      const signedTx = new StellarSdk.Transaction(
        signedXDR,
        STELLAR_CONFIG.networkPassphrase
      );

      // Send to network
      const response = await this.server.sendTransaction(signedTx);

      console.log("✅ Transaction submitted!");
      console.log("Hash:", response.hash);

      return {
        hash: response.hash,
        status: "SUCCESS",
      };
    } catch (error) {
      console.error("❌ Transaction failed:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });

      // Better error messages
      if (error.message?.includes("User declined")) {
        throw new Error("Transaction cancelled by user");
      }

      if (error.message?.includes("insufficient")) {
        throw new Error("Insufficient XLM balance");
      }

      if (error.message?.includes("switch")) {
        throw new Error(
          "Transaction format error. Please try reconnecting your wallet."
        );
      }

      throw new Error(error.message || "Transaction failed");
    }
  }

  async simulateContract(contractId, method, params = []) {
    try {
      const contract = new StellarSdk.Contract(contractId);
      const sourceAccount = await this.server.getAccount(this.publicKey);

      const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: STELLAR_CONFIG.networkPassphrase,
      })
        .addOperation(contract.call(method, ...params))
        .setTimeout(30)
        .build();

      const simulated = await this.server.simulateTransaction(transaction);

      if (simulated.results?.[0]?.retval) {
        return StellarSdk.scValToNative(simulated.results[0].retval);
      }

      return null;
    } catch (error) {
      console.error("Simulation failed:", error);
      return null;
    }
  }
}
