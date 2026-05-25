import { NewsItem, Strategy, SignalEvaluation } from "./types";
import { config } from "./config";

export async function evaluateSignal(
  news: NewsItem,
  strategy: Strategy
): Promise<SignalEvaluation> {
  const prompt = buildPrompt(news, strategy);

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": config.anthropic.apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: config.anthropic.model,
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await response.json() as any;
  const text = data.content?.[0]?.text || "";

  return parseEvaluation(text);
}

const SYSTEM_PROMPT = `You are a disciplined trading signal evaluator for a copy-trading platform.
You receive a news signal and a strategy's rules, and decide whether to trade.
Always respond in valid JSON only. No preamble, no markdown, no explanation outside the JSON.
Format:
{
  "shouldTrade": boolean,
  "reasoning": "one sentence",
  "suggestedSide": "BUY" | "SELL" | null,
  "confidence": 0.0-1.0,
  "riskFlags": ["flag1", "flag2"]
}`;

function buildPrompt(news: NewsItem, strategy: Strategy): string {
  return `NEWS SIGNAL:
Title: ${news.title}
Summary: ${news.summary}
Coins mentioned: ${news.coins.join(", ")}
Sentiment score: ${news.sentiment ?? "unknown"}
Timestamp: ${new Date(news.timestamp).toISOString()}

STRATEGY RULES:
Watch coins: ${strategy.rules.watchCoins.join(", ")}
Sentiment threshold: ${strategy.rules.sentimentThreshold}
Max position: ${strategy.rules.maxPositionPct * 100}% of balance
Stop loss: ${strategy.rules.stopLossPct * 100}%
Cooldown: ${strategy.rules.cooldownMinutes} minutes between trades

Does this news signal meet the strategy rules? Should we trade?`;
}

function parseEvaluation(text: string): SignalEvaluation {
  try {
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return {
      shouldTrade: false,
      reasoning: "Failed to parse AI response — skipping trade for safety",
      suggestedSide: null,
      confidence: 0,
      riskFlags: ["parse_error"],
    };
  }
}
