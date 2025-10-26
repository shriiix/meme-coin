# MemeCoin Platform

Create, trade, and discover meme coins on Stellar using Soroban smart contracts and a React + Vite frontend.

Table of contents
- [About](#about)
- [Features](#features)
- [Architecture & folders](#architecture--folders)
- [Prerequisites](#prerequisites)
- [Quick start (local)](#quick-start-local)
- [Contracts: build & test](#contracts-build--test)
- [Frontend](#frontend)
- [Scripts](#scripts)
- [Contributing](#contributing)
- [License](#license)

## About

This repository implements a small decentralized exchange and token platform on Stellar using Soroban smart contracts. It includes:

- Smart contracts (Rust) for tokens, a token factory, and a DEX located under `contracts/`.
- A React frontend (Vite) to interact with the contracts under `frontend/`.
- Helper scripts for building, deploying and testing the contracts in `scripts/`.

## Features

- Create and mint tokens (token factory)
- Trade tokens on a simple DEX contract
- Web UI for creating tokens, viewing markets, and trading

## Architecture & folders

Top-level layout (important folders):

- `contracts/` – Soroban smart contracts
	- `dex/` – DEX contract
	- `token/` – Token contract
	- `token-factory/` – Factory for creating/initializing new tokens
- `scripts/` – Build, deploy and test scripts (bash)
- `frontend/` – React + Vite web application
	- `src/` – React source including components, hooks, services and store
	- `public/`, `index.html`, `package.json` – frontend assets and config

See the repository root for additional files and docs.

## Prerequisites

Local development requires:

- Node.js 18+ (for the frontend)
- npm or yarn
- Rust toolchain (stable; for Soroban contracts)
- Soroban tooling (if you're building/deploying contracts directly) or the provided scripts

Notes for Windows users:
- The repository's helper scripts are POSIX shell scripts (`.sh`). On Windows run them under WSL, Git Bash, or use a Linux/macOS environment. Frontend commands (npm) work natively on PowerShell.

## Quick start (local)

1. Install frontend dependencies and run the UI

```powershell
cd frontend
npm install
npm run dev
# open http://localhost:5173
```

2. Build contracts (use WSL/Git Bash):

```bash
# from repository root
./scripts/build-all.sh
```

3. Deploy or initialize contracts (scripts provided):

```bash
# deploy contracts (local testnet or configured network)
./scripts/deploy-all.sh
./scripts/initialize-contracts.sh
```

If you prefer PowerShell on Windows and have WSL installed:

```powershell
wsl ./scripts/build-all.sh
wsl ./scripts/deploy-all.sh
```

## Contracts: build & test

- Contracts are in `contracts/*` and use Cargo (Rust). The repository provides `scripts/` to automate building and testing.
- Example (POSIX shell):

```bash
./scripts/test-contracts.sh
```

If you need to build a single contract, `cd` into its directory and use Cargo with the Soroban toolchain you prefer.

## Frontend

- The frontend is a Vite React app located in `frontend/`.
- Notable code areas:
	- `src/components/` – UI components and token/trading pages
	- `src/hooks/` – React hooks for wallet, tokens, trades
	- `src/services/` – API and blockchain interaction helpers

Run locally:

```powershell
cd frontend
npm install
npm run dev
```

Build for production:

```powershell
cd frontend
npm run build
```

## Scripts

Helpful scripts are in `scripts/`:

- `build-all.sh` – builds all contracts
- `deploy-all.sh` – deploys contracts to configured network
- `deploy-dex.sh`, `deploy-factory.sh` – deploy specific contracts
- `initialize-contracts.sh` – post-deploy initialization
- `test-contracts.sh` – run contract tests

Always run these from a POSIX-compatible shell (WSL/Git Bash) on Windows.

## Configuration

- Frontend config files: `frontend/src/config/*.js` (contract addresses, network settings)
- Contracts include local Cargo configs under each contract folder.

## Contributing

Contributions are welcome. Suggested workflow:

1. Fork the repo and create a feature branch.
2. Add tests for contract changes and run `./scripts/test-contracts.sh`.
3. Update frontend snapshots/tests as needed and run frontend tests/lint.
4. Open a PR with a clear description of changes.

If you plan to run contracts on a live/test Stellar network, be careful with keys and secrets. Do not commit private keys.

## License

See `LICENSE` at repository root if present. If none exists, add a license you prefer (MIT/Apache-2.0, etc.).

## Contact / Help

If you need help, open an issue describing your environment and the steps to reproduce any problem. Include OS, Node/Rust versions, and whether you're using WSL on Windows.

---

This README was generated to improve onboarding and explain the repository layout and common workflows. If you'd like I can also:

- Add a CONTRIBUTING.md with a checklist and PR template
- Add GitHub Actions for CI to build and test contracts and frontend on PRs
- Provide a Windows-specific helper script (PowerShell) to call WSL commands transparently