#!/bin/bash

set -e

echo "🔨 Building all contracts..."

# Build token contract
echo "Building token contract..."
cd token
soroban contract build
cd ..

# Build token factory contract
echo "Building token-factory contract..."
cd token-factory
soroban contract build
cd ..

# Build DEX contract
echo "Building dex contract..."
cd dex
soroban contract build
cd ..

echo "✅ All contracts built successfully!"
echo ""
echo "Output files:"
echo "  - token/target/wasm32-unknown-unknown/release/token.wasm"
echo "  - token-factory/target/wasm32-unknown-unknown/release/token_factory.wasm"
echo "  - dex/target/wasm32-unknown-unknown/release/dex.wasm"
