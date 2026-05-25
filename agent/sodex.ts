import { ethers } from "ethers";
import { config } from "./config";
import { Subscriber, OrderResult } from "./types";

function buildHeaders(body: object, privateKey: string, apiKeyName: string) {
  const nonce = Date.now();
  const payload = JSON.stringify({ ...body, nonce });
  const wallet = new ethers.Wallet(privateKey);
  const hash = ethers.hashMessage(payload);
  // Note: full signing implementation per SoDEX Go SDK guide
  // See: https://sodex.com/documentation/api/go-sdk-signing-guide
  const signature = wallet.signMessageSync(ethers.getBytes(hash));
  return {
    "Content-Type": "application/json",
    "X-API-Key": apiKeyName,
    "X-API-Sign": signature,
    "X-API-Nonce": String(nonce),
  };
}

export async function getAccountBalance(
  subscriber: Subscriber
): Promise<number> {
  const body = { accountId: subscriber.sodexAccountId };
  const headers = buildHeaders(body, subscriber.sodexPrivateKey, subscriber.sodexApiKeyName);

  const res = await fetch(`${config.sodex.baseUrl}/account`, {
    method: "GET",
    headers,
  });
  const data = await res.json() as any;
  // Return USDT balance
  return parseFloat(data?.balances?.USDT || "0");
}

export async function placeOrder(
  subscriber: Subscriber,
  symbol: string,
  side: "BUY" | "SELL",
  quantity: number
): Promise<OrderResult> {
  const body = {
    symbol,
    side,
    type: "MARKET",
    quantity: quantity.toFixed(6),
    accountId: subscriber.sodexAccountId,
  };

  const headers = buildHeaders(body, subscriber.sodexPrivateKey, subscriber.sodexApiKeyName);

  try {
    const res = await fetch(`${config.sodex.baseUrl}/order`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    const data = await res.json() as any;
    return {
      subscriberId: subscriber.id,
      orderId: data.orderId || "unknown",
      status: data.status === "FILLED" ? "FILLED" : "PARTIAL",
      quantity,
      price: parseFloat(data.price || "0"),
    };
  } catch (err: any) {
    return {
      subscriberId: subscriber.id,
      orderId: "error",
      status: "FAILED",
      quantity,
      price: 0,
    };
  }
}

export async function mirrorTrade(
  subscribers: Subscriber[],
  symbol: string,
  side: "BUY" | "SELL",
  maxPositionPct: number
): Promise<OrderResult[]> {
  const results: OrderResult[] = [];

  // Queue orders — don't hammer API in parallel
  for (const sub of subscribers) {
    if (!sub.active) continue;
    const balance = await getAccountBalance(sub);
    const quantity = (balance * maxPositionPct) / 1; // simplified: qty = USDT / price (use market price in production)
    const result = await placeOrder(sub, symbol, side, quantity);
    results.push(result);
    await sleep(200); // 200ms between orders — respect rate limits
  }

  return results;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
