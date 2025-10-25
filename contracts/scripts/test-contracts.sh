#!/bin/bash

set -e

echo "🧪 Testing all contracts..."

# Test token contract
echo "Testing token contract..."
cd token
cargo test
cd ..

# Test token factory contract
echo "Testing token-factory contract..."
cd token-factory
cargo test
cd ..

# Test DEX contract
echo "Testing dex contract..."
cd dex
cargo test
cd ..

echo "✅ All tests passed!"
