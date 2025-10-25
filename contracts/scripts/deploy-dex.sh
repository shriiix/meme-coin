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

echo "🚀 Deploying DEX Contract..."

# Deploy DEX contract
echo "📤 Deploying DEX contract..."
DEX_CONTRACT_ID=$(soroban contract deploy \
  --wasm ../dex/target/wasm32-unknown-unknown/release/dex.wasm \
  --source $STELLAR_SECRET_KEY \
  --rpc-url $RPC_URL \
  --network-passphrase "$NETWORK_PASSPHRASE")

echo "✅ DEX deployed: $DEX_CONTRACT_ID"

# Get admin address from secret key
ADMIN_ADDRESS=$(soroban keys address $STELLAR_SECRET_KEY)

# Initialize the DEX
echo "🔧 Initializing DEX..."
soroban contract invoke \
  --id $DEX_CONTRACT_ID \
  --source $STELLAR_SECRET_KEY \
  --rpc-url $RPC_URL \
  --network-passphrase "$NETWORK_PASSPHRASE" \
  -- initialize \
  --admin $ADMIN_ADDRESS

echo ""
echo "🎉 Deployment Complete!"
echo ""
echo "======================================"
echo "Contract Details:"
echo "======================================"
echo "DEX Contract ID: $DEX_CONTRACT_ID"
echo "Admin Address: $ADMIN_ADDRESS"
echo ""
echo "Add this to your .env file:"
echo "VITE_DEX_CONTRACT_ID=$DEX_CONTRACT_ID"
