import { config } from "./config";
import { fetchHotNews } from "./sosovalue";
import { evaluateSignal } from "./evaluator";
import { mirrorTrade } from "./sodex";
import { store } from "./store";
import { TradeRecord } from "./types";
import { randomUUID } from "crypto";

console.log("🚀 CopyFi agent starting...");
console.log(`   Testnet: ${config.sodex.baseUrl.includes("testnet")}`);
console.log(`   Poll interval: ${config.app.pollIntervalMs}ms`);

// Seed a demo strategy for Wave 2 testing
store.addStrategy({
  id: "strategy-001",
  name: "BTC Sentiment Momentum",
  description: "Buys BTC when news sentiment is strongly positive",
  ownerId: "builder-001",
  rules: {
    watchCoins: ["BTC", "ETH"],
    sentimentThreshold: 0.65,
    maxPositionPct: 0.05,   // 5% of balance per trade
    stopLossPct: 0.03,       // 3% stop loss
    cooldownMinutes: 60,
  },
  createdAt: Date.now(),
  active: true,
});

async function runLoop() {
  console.log(`\n[${new Date().toISOString()}] Polling signals...`);

  const news = await fetchHotNews();
  console.log(`   Got ${news.length} hot news items`);

  const strategies = store.getAllStrategies().filter((s) => s.active);

  for (const strategy of strategies) {
    for (const item of news) {
      // Skip already-processed news
      if (store.isProcessed(item.id)) continue;

      // Skip if no relevant coins mentioned
      const relevant = item.coins.some((c) =>
        strategy.rules.watchCoins.map((w) => w.toUpperCase()).includes(c.toUpperCase())
      );
      if (!relevant) continue;

      console.log(`\n   Evaluating: "${item.title.slice(0, 60)}..."`);
      const evaluation = await evaluateSignal(item, strategy);
      console.log(`   Decision: ${evaluation.shouldTrade ? "TRADE ✅" : "SKIP ⏭️"} — ${evaluation.reasoning}`);

      if (evaluation.shouldTrade && evaluation.suggestedSide) {
        const subscribers = store.getSubscribers(strategy.id);
        console.log(`   Mirroring to ${subscribers.length} subscribers...`);

        const orders = await mirrorTrade(
          subscribers,
          `${strategy.rules.watchCoins[0]}-USDT`,
          evaluation.suggestedSide,
          strategy.rules.maxPositionPct
        );

        const record: TradeRecord = {
          id: randomUUID(),
          strategyId: strategy.id,
          signal: item,
          evaluation,
          executedAt: Date.now(),
          orders,
        };

        store.addTrade(record);
        console.log(`   Trade recorded: ${record.id}`);
      }

      store.markProcessed(item.id);
    }
  }
}

// Run immediately then on interval
runLoop().catch(console.error);
setInterval(() => runLoop().catch(console.error), config.app.pollIntervalMs);
