import * as StellarSdk from "stellar-sdk";
import { STELLAR_CONFIG } from "../config/stellar.config";

export class StellarService {
  constructor(walletKit, publicKey) {
    this.walletKit = walletKit;
    this.publicKey = publicKey;
    this.server = new StellarSdk.rpc.Server(STELLAR_CONFIG.sorobanRpcUrl);
  }

  async invokeContract(contractId, method, params = []) {
    try {
      console.log("📤 Creating contract call:", { contractId, method });

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

      // Prepare transaction
      const preparedTransaction = await this.server.prepareTransaction(
        builtTransaction
      );

      console.log("✍️ Signing transaction...");

      // Sign with wallet
      const signedXDR = await this.walletKit.sign(preparedTransaction.toXDR(), {
        networkPassphrase: STELLAR_CONFIG.networkPassphrase,
      });

      console.log("📨 Submitting to network...");

      // Parse signed transaction
      const signedTx = StellarSdk.TransactionBuilder.fromXDR(
        signedXDR,
        STELLAR_CONFIG.networkPassphrase
      );

      // Send transaction
      const response = await this.server.sendTransaction(signedTx);

      console.log("✅ Transaction submitted:", response.hash);

      // Return immediately - don't wait
      return {
        hash: response.hash,
        status: "SUBMITTED",
      };
    } catch (error) {
      console.error("❌ Transaction failed:", error);

      // Better error messages
      if (error.message?.includes("insufficient")) {
        throw new Error("Insufficient XLM balance. Please fund your account.");
      }

      if (error.message?.includes("not authorized")) {
        throw new Error(
          "Transaction not authorized. Please check wallet connection."
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
