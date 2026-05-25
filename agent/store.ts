// In-memory store for Wave 2 — swap for a DB in Wave 3
import { Strategy, Subscriber, TradeRecord } from "./types";

const strategies = new Map<string, Strategy>();
const subscribers = new Map<string, Subscriber[]>(); // strategyId -> subscribers
const tradeHistory: TradeRecord[] = [];
const processedNewsIds = new Set<string>();

export const store = {
  // Strategies
  addStrategy(s: Strategy) { strategies.set(s.id, s); },
  getStrategy(id: string) { return strategies.get(id); },
  getAllStrategies() { return [...strategies.values()]; },

  // Subscribers
  addSubscriber(sub: Subscriber) {
    const list = subscribers.get(sub.strategyId) || [];
    list.push(sub);
    subscribers.set(sub.strategyId, list);
  },
  getSubscribers(strategyId: string): Subscriber[] {
    return subscribers.get(strategyId) || [];
  },

  // Trade history (on-chain logger target in Wave 3)
  addTrade(t: TradeRecord) { tradeHistory.push(t); },
  getTrades(strategyId?: string) {
    return strategyId
      ? tradeHistory.filter((t) => t.strategyId === strategyId)
      : tradeHistory;
  },

  // Dedup — don't re-process the same news item
  isProcessed(newsId: string) { return processedNewsIds.has(newsId); },
  markProcessed(newsId: string) { processedNewsIds.add(newsId); },
};
