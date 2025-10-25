import * as StellarSdk from "stellar-sdk";
import { STELLAR_CONFIG } from "../config/stellar.config";
import { TRANSACTION_STATUS } from "../utils/constants";
import { sleep } from "../utils/helpers";

export class StellarService {
  constructor(walletKit, publicKey) {
    this.walletKit = walletKit;
    this.publicKey = publicKey;
    this.server = new StellarSdk.SorobanRpc.Server(
      STELLAR_CONFIG.sorobanRpcUrl
    );
  }

  async invokeContract(contractId, method, params = []) {
    try {
      const contract = new StellarSdk.Contract(contractId);
      const account = await this.server.getAccount(this.publicKey);

      const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: STELLAR_CONFIG.networkPassphrase,
      })
        .addOperation(contract.call(method, ...params))
        .setTimeout(30)
        .build();

      const preparedTx = await this.server.prepareTransaction(transaction);
      const { signedTxXdr } = await this.walletKit.signTransaction(
        preparedTx.toXDR()
      );

      const tx = StellarSdk.TransactionBuilder.fromXDR(
        signedTxXdr,
        STELLAR_CONFIG.networkPassphrase
      );

      const result = await this.server.sendTransaction(tx);
      return await this.waitForTransaction(result.hash);
    } catch (error) {
      console.error("Contract invocation failed:", error);
      throw new Error(error.message || "Transaction failed");
    }
  }

  async simulateContract(contractId, method, params = []) {
    try {
      const contract = new StellarSdk.Contract(contractId);
      const account = await this.server.getAccount(this.publicKey);

      const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: STELLAR_CONFIG.networkPassphrase,
      })
        .addOperation(contract.call(method, ...params))
        .setTimeout(30)
        .build();

      const result = await this.server.simulateTransaction(transaction);

      if (result.results && result.results[0]) {
        return StellarSdk.scValToNative(result.results[0].retval);
      }

      return null;
    } catch (error) {
      console.error("Contract simulation failed:", error);
      throw error;
    }
  }

  async waitForTransaction(hash, maxAttempts = 30) {
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const status = await this.server.getTransaction(hash);

        if (status.status === TRANSACTION_STATUS.SUCCESS) {
          return status;
        }

        if (status.status === TRANSACTION_STATUS.FAILED) {
          throw new Error("Transaction failed");
        }

        await sleep(1000);
        attempts++;
      } catch (error) {
        if (attempts >= maxAttempts - 1) {
          throw new Error("Transaction timeout");
        }
        await sleep(1000);
        attempts++;
      }
    }

    throw new Error("Transaction timeout");
  }
}
