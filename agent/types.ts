export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  timestamp: number;
  coins: string[];
  sentiment?: number;
}

export interface Strategy {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  rules: StrategyRules;
  createdAt: number;
  active: boolean;
}

export interface StrategyRules {
  watchCoins: string[];
  sentimentThreshold: number;
  maxPositionPct: number;
  stopLossPct: number;
  cooldownMinutes: number;
}

export interface Subscriber {
  id: string;
  strategyId: string;
  sodexAccountId: string;
  sodexApiKeyName: string;
  sodexPrivateKey: string;
  allocatedUsdt: number;
  active: boolean;
}

export interface SignalEvaluation {
  shouldTrade: boolean;
  reasoning: string;
  suggestedSide: "BUY" | "SELL" | null;
  confidence: number;
  riskFlags: string[];
}

export interface TradeRecord {
  id: string;
  strategyId: string;
  signal: NewsItem;
  evaluation: SignalEvaluation;
  executedAt: number;
  orders: OrderResult[];
  pnl?: number;
}

export interface OrderResult {
  subscriberId: string;
  orderId: string;
  status: "FILLED" | "PARTIAL" | "FAILED";
  quantity: number;
  price: number;
}
