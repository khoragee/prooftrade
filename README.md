# CopyFi — On-Chain Copy Trading Infrastructure

> Wave 2 submission — SoSoValue Buildathon

## What it does

CopyFi lets anyone publish a trading strategy on-chain. Other users subscribe and their positions mirror automatically via SoDEX whenever a signal fires — with every decision logged immutably on ValueChain.

## Stack

- **Backend agent**: Node.js / TypeScript
- **Signal source**: SoSoValue API (news + index data)
- **AI evaluator**: Claude (Anthropic) — evaluates every signal against strategy rules
- **Execution**: SoDEX API (spot orderbook, testnet)
- **On-chain log**: ValueChain (EVM-compatible)
- **API**: Express REST

## Architecture

```
SoSoValue API → Agent polls /news/hot every 60s
                     ↓
             Claude evaluates signal vs strategy rules
                     ↓
             Trade decision logged on ValueChain
                     ↓
             SoDEX executes order for each subscriber
```

## Quick start

```bash
cp .env.example .env
# Fill in your API keys

npm install
npm run dev          # starts agent
# In another terminal:
npx tsx api/server.ts  # starts REST API
```

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /strategies | List all strategies |
| POST | /strategies | Create a strategy |
| POST | /strategies/:id/subscribe | Subscribe to a strategy |
| GET | /trades | Trade history |
| GET | /trades/:id/stats | Strategy performance stats |

## Wave 2 progress

- [x] Project scaffolding
- [x] SoSoValue news polling
- [x] AI signal evaluator (Claude)
- [x] SoDEX order execution module
- [x] Subscriber mirroring logic
- [x] REST API
- [ ] ValueChain on-chain logging (Wave 3)
- [ ] Frontend marketplace UI (Wave 3)
- [ ] Backtesting module (Wave 3)
