#!/bin/bash

set -e

# Configuration
NETWORK="testnet"
RPC_URL="https://soroban-testnet.stellar.org"
NETWORK_PASSPHRASE="Test SDF Network ; September 2015"

# Check if secret key is provided
if [ -z "$STELLAR_SECRET_KEY" ]; then
    echo "❌ Error: STELLAR_SECRET_KEY environment variable not set"
    echo "Usage: export STELLAR_SECRET_KEY=your_secret_key"
    exit 1
fi

echo "🚀 Deploying Token Factory Contract..."

# Step 1: Upload token WASM and get hash
echo "📤 Uploading token contract WASM..."
TOKEN_WASM_HASH=$(soroban contract install \
  --wasm ../token/target/wasm32-unknown-unknown/release/token.wasm \
  --source $STELLAR_SECRET_KEY \
  --rpc-url $RPC_URL \
  --network-passphrase "$NETWORK_PASSPHRASE")

echo "✅ Token WASM uploaded: $TOKEN_WASM_HASH"

# Step 2: Deploy token factory contract
echo "📤 Deploying token factory contract..."
FACTORY_CONTRACT_ID=$(soroban contract deploy \
  --wasm ../token-factory/target/wasm32-unknown-unknown/release/token_factory.wasm \
  --source $STELLAR_SECRET_KEY \
  --rpc-url $RPC_URL \
  --network-passphrase "$NETWORK_PASSPHRASE")

echo "✅ Token Factory deployed: $FACTORY_CONTRACT_ID"

# Step 3: Get admin address from secret key
ADMIN_ADDRESS=$(soroban keys address $STELLAR_SECRET_KEY)

# Step 4: Initialize the factory with token WASM hash
echo "🔧 Initializing token factory..."
soroban contract invoke \
  --id $FACTORY_CONTRACT_ID \
  --source $STELLAR_SECRET_KEY \
  --rpc-url $RPC_URL \
  --network-passphrase "$NETWORK_PASSPHRASE" \
  -- initialize \
  --admin $ADMIN_ADDRESS \
  --token_wasm_hash $TOKEN_WASM_HASH

echo ""
echo "🎉 Deployment Complete!"
echo ""
echo "======================================"
echo "Contract Details:"
echo "======================================"
echo "Token WASM Hash: $TOKEN_WASM_HASH"
echo "Factory Contract ID: $FACTORY_CONTRACT_ID"
echo "Admin Address: $ADMIN_ADDRESS"
echo ""
echo "Add these to your .env file:"
echo "VITE_TOKEN_FACTORY_CONTRACT_ID=$FACTORY_CONTRACT_ID"
