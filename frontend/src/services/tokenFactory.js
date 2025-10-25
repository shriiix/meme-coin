import * as StellarSdk from "stellar-sdk";
import { StellarService } from "./stellarService";
import { CONTRACTS } from "../config/contracts.config";
import { STELLAR_CONFIG } from "../config/stellar.config";

export class TokenFactoryService extends StellarService {
  constructor(walletKit, publicKey) {
    super(walletKit, publicKey);
    this.contractId = CONTRACTS.tokenFactory;
  }

  async createToken(name, symbol, decimals, initialSupply) {
    if (!this.contractId) {
      throw new Error("Token Factory contract not configured");
    }

    try {
      const params = [
        new StellarSdk.Address(this.publicKey).toScVal(),
        StellarSdk.nativeToScVal(name, { type: "string" }),
        StellarSdk.nativeToScVal(symbol, { type: "string" }),
        StellarSdk.nativeToScVal(decimals, { type: "u32" }),
        StellarSdk.nativeToScVal(parseInt(initialSupply), { type: "i128" }),
      ];

      const result = await this.invokeContract(
        this.contractId,
        "create_token",
        params
      );

      return result;
    } catch (error) {
      console.error("Token creation failed:", error);
      throw new Error(error.message || "Failed to create token");
    }
  }

  /**
   * Extract return value from simulation response
   * Handles multiple response formats from Stellar RPC
   */
  extractSimulationResult(simulation) {
    try {
      console.log("🔍 Parsing simulation response...");

      // Method 1: Standard results array (older SDK format)
      if (simulation.results && simulation.results[0]?.retval) {
        console.log("✅ Found result in results[0].retval");
        return StellarSdk.scValToNative(simulation.results[0].retval);
      }

      // Method 2: Direct result property
      if (simulation.result?.retval) {
        console.log("✅ Found result in result.retval");
        return StellarSdk.scValToNative(simulation.result.retval);
      }

      // Method 3: Top-level retval
      if (simulation.retval) {
        console.log("✅ Found result in retval");
        return StellarSdk.scValToNative(simulation.retval);
      }

      // Method 4: Check returnValue
      if (simulation.returnValue) {
        console.log("✅ Found result in returnValue");
        return StellarSdk.scValToNative(simulation.returnValue);
      }

      // Method 5: Parse from transactionData (new Stellar format)
      if (simulation.transactionData) {
        console.log(
          "⚠️ Result might be in transactionData, trying to decode..."
        );

        try {
          // Try to decode the XDR transaction data
          const txData = StellarSdk.xdr.SorobanTransactionData.fromXDR(
            simulation.transactionData,
            "base64"
          );

          console.log("Decoded transaction data:", txData);

          // Check if there's return value in the decoded data
          if (
            txData.ext &&
            txData.ext().value &&
            txData.ext().value().sorobanReturnValue
          ) {
            const retVal = txData.ext().value().sorobanReturnValue();
            return StellarSdk.scValToNative(retVal);
          }
        } catch (xdrError) {
          console.log("Could not decode transactionData:", xdrError.message);
        }
      }

      console.warn("⚠️ No return value found in any known location");
      return null;
    } catch (error) {
      console.error("Error extracting simulation result:", error);
      return null;
    }
  }

  async getTokenCount() {
    if (!this.contractId) {
      console.warn("No contract ID configured");
      return 0;
    }

    try {
      console.log("📊 Getting token count from blockchain...");

      const contract = new StellarSdk.Contract(this.contractId);
      const sourceAccount = await this.server.getAccount(this.publicKey);

      const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: "100000",
        networkPassphrase: STELLAR_CONFIG.networkPassphrase,
      })
        .addOperation(contract.call("get_token_count"))
        .setTimeout(30)
        .build();

      console.log("📡 Simulating get_token_count...");
      const simulation = await this.server.simulateTransaction(tx);

      console.log("Raw simulation response:", simulation);

      // Extract result using our helper
      const count = this.extractSimulationResult(simulation);

      if (count !== null && count !== undefined) {
        const parsedCount = typeof count === "number" ? count : parseInt(count);
        console.log(`✅ Token count: ${parsedCount}`);
        return parsedCount || 0;
      }

      console.warn("⚠️ Could not extract token count, returning 0");
      return 0;
    } catch (error) {
      console.error("❌ Failed to get token count:", error);
      return 0;
    }
  }

  async getTokenInfo(tokenId) {
    if (!this.contractId) {
      return null;
    }

    try {
      console.log(`📋 Fetching token #${tokenId} from blockchain...`);

      const contract = new StellarSdk.Contract(this.contractId);
      const sourceAccount = await this.server.getAccount(this.publicKey);

      const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: "100000",
        networkPassphrase: STELLAR_CONFIG.networkPassphrase,
      })
        .addOperation(
          contract.call(
            "get_token_info",
            StellarSdk.nativeToScVal(tokenId, { type: "u32" })
          )
        )
        .setTimeout(30)
        .build();

      const simulation = await this.server.simulateTransaction(tx);

      // Extract result
      const info = this.extractSimulationResult(simulation);

      if (!info) {
        console.log(`Token #${tokenId} not found`);
        return null;
      }

      console.log(`✅ Token #${tokenId} data:`, info);

      // Parse and format the token data
      return {
        token_id: info.token_id || tokenId,
        name: info.name || "Unknown Token",
        symbol: info.symbol || "???",
        decimals: typeof info.decimals === "number" ? info.decimals : 7,
        total_supply: info.total_supply || info.totalSupply || 0,
        creator: info.creator || "",
        contract_address: info.contract_address || info.contractAddress || "",
        created_at: info.created_at || info.createdAt || 0,
      };
    } catch (error) {
      console.error(`Failed to get token #${tokenId}:`, error);
      return null;
    }
  }

  async getAllTokens() {
    try {
      console.log("🔄 Fetching all tokens from blockchain...");

      // First get the count
      const count = await this.getTokenCount();
      console.log(`📊 Total tokens on blockchain: ${count}`);

      if (count === 0) {
        console.log("No tokens found on blockchain");
        return [];
      }

      const tokens = [];
      const promises = [];

      // Fetch all tokens in parallel for better performance
      for (let i = 1; i <= count; i++) {
        promises.push(
          this.getTokenInfo(i).catch((error) => {
            console.error(`Error fetching token ${i}:`, error);
            return null;
          })
        );
      }

      const results = await Promise.all(promises);

      // Filter out null results and add to tokens array
      results.forEach((token) => {
        if (token) {
          tokens.push(token);
        }
      });

      console.log(
        `✅ Successfully fetched ${tokens.length} out of ${count} tokens`
      );
      return tokens;
    } catch (error) {
      console.error("Failed to get all tokens:", error);
      return [];
    }
  }

  async getCreatorTokens(creatorAddress) {
    if (!this.contractId) {
      return [];
    }

    try {
      console.log(`🔍 Fetching tokens for creator: ${creatorAddress}`);

      const contract = new StellarSdk.Contract(this.contractId);
      const sourceAccount = await this.server.getAccount(this.publicKey);

      const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: "100000",
        networkPassphrase: STELLAR_CONFIG.networkPassphrase,
      })
        .addOperation(
          contract.call(
            "get_creator_tokens",
            new StellarSdk.Address(creatorAddress).toScVal()
          )
        )
        .setTimeout(30)
        .build();

      const simulation = await this.server.simulateTransaction(tx);
      const tokenIds = this.extractSimulationResult(simulation);

      if (!tokenIds || !Array.isArray(tokenIds) || tokenIds.length === 0) {
        console.log("No tokens found for this creator");
        return [];
      }

      console.log(`Found ${tokenIds.length} token IDs for creator`);

      // Fetch details for each token
      const tokens = [];
      for (const id of tokenIds) {
        const info = await this.getTokenInfo(id);
        if (info) {
          tokens.push(info);
        }
      }

      return tokens;
    } catch (error) {
      console.error("Failed to get creator tokens:", error);
      return [];
    }
  }
}
