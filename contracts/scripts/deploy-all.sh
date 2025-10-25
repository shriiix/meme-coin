#!/bin/bash

set -e

echo "🚀 Starting Full Deployment..."
echo ""

# Check deployer exists
if ! stellar keys address deployer &> /dev/null; then
    echo "Creating deployer identity..."
    stellar keys generate deployer --network testnet --global
    echo "Fund at: https://friendbot.stellar.org?addr=$(stellar keys address deployer)"
    read -p "Press enter once funded..."
fi

# Check balance
BALANCE=$(stellar keys balance deployer --network testnet 2>/dev/null || echo "0")
echo "Balance: $BALANCE XLM"

if [[ "$BALANCE" == "0.0000000" ]] || [[ -z "$BALANCE" ]]; then
    echo "Funding account..."
    curl -s "https://friendbot.stellar.org?addr=$(stellar keys address deployer)" > /dev/null
    sleep 5
fi

# 1. Install Token WASM
echo ""
echo "📤 [1/7] Installing Token WASM..."
TOKEN_WASM_HASH=$(stellar contract install \
  --wasm token/target/wasm32-unknown-unknown/release/token.wasm \
  --source deployer \
  --network testnet)
echo "✅ Token WASM: $TOKEN_WASM_HASH"

# 2. Deploy Token Factory
echo ""
echo "📤 [2/7] Deploying Token Factory..."
FACTORY_ID=$(stellar contract deploy \
  --wasm token-factory/target/wasm32-unknown-unknown/release/token_factory.wasm \
  --source deployer \
  --network testnet)
echo "✅ Factory ID: $FACTORY_ID"

# 3. Initialize Factory
echo ""
echo "🔧 [3/7] Initializing Factory..."
stellar contract invoke \
  --id $FACTORY_ID \
  --source deployer \
  --network testnet \
  -- initialize \
  --admin $(stellar keys address deployer) \
  --token_wasm_hash $TOKEN_WASM_HASH
echo "✅ Factory Initialized"

# 4. Deploy DEX
echo ""
echo "📤 [4/7] Deploying DEX..."
DEX_ID=$(stellar contract deploy \
  --wasm dex/target/wasm32-unknown-unknown/release/dex.wasm \
  --source deployer \
  --network testnet)
echo "✅ DEX ID: $DEX_ID"

# 5. Initialize DEX
echo ""
echo "🔧 [5/7] Initializing DEX..."
stellar contract invoke \
  --id $DEX_ID \
  --source deployer \
  --network testnet \
  -- initialize \
  --admin $(stellar keys address deployer)
echo "✅ DEX Initialized"

# 6. Create Test Token
echo ""
echo "🧪 [6/7] Creating Test Token..."
TEST_TOKEN=$(stellar contract invoke \
  --id $FACTORY_ID \
  --source deployer \
  --network testnet \
  -- create_token \
  --creator $(stellar keys address deployer) \
  --name "Test Meme Coin" \
  --symbol "TMC" \
  --decimals 7 \
  --initial_supply 1000000000000 2>&1 | grep -o 'C[A-Z0-9]\{55\}' | head -1)
echo "✅ Test Token: $TEST_TOKEN"

# 7. Verify
echo ""
echo "✅ [7/7] Verifying..."
TOKEN_COUNT=$(stellar contract invoke \
  --id $FACTORY_ID \
  --source deployer \
  --network testnet \
  -- get_token_count)
echo "Total Tokens: $TOKEN_COUNT"

# Summary
echo ""
echo "=========================================="
echo "🎉 DEPLOYMENT COMPLETE!"
echo "=========================================="
echo ""
echo "Token WASM Hash:"
echo "$TOKEN_WASM_HASH"
echo ""
echo "Token Factory Contract:"
echo "$FACTORY_ID"
echo ""
echo "DEX Contract:"
echo "$DEX_ID"
echo ""
echo "Test Token Address:"
echo "$TEST_TOKEN"
echo ""
echo "Admin Address:"
echo "$(stellar keys address deployer)"
echo ""
echo "=========================================="
echo "Frontend .env Configuration:"
echo "=========================================="
echo "VITE_TOKEN_FACTORY_CONTRACT_ID=$FACTORY_ID"
echo "VITE_DEX_CONTRACT_ID=$DEX_ID"
echo ""

# Save to file
cat > deployment-info.txt << EOF
Deployment Summary
==================
Date: $(date)
Network: Stellar Testnet

Token WASM Hash: $TOKEN_WASM_HASH
Token Factory: $FACTORY_ID
DEX Contract: $DEX_ID
Test Token: $TEST_TOKEN
Admin: $(stellar keys address deployer)

Frontend .env:
VITE_TOKEN_FACTORY_CONTRACT_ID=$FACTORY_ID
VITE_DEX_CONTRACT_ID=$DEX_ID
EOF

echo "📝 Saved to deployment-info.txt"
echo ""
echo "Next: cd ../frontend && npm install && npm run dev"
