import axios from "axios";
import { config } from "./config";
import { NewsItem } from "./types";

const client = axios.create({
  baseURL: config.sosovalue.baseUrl,
  headers: { "x-soso-api-key": config.sosovalue.apiKey },
});

export async function fetchHotNews(): Promise<NewsItem[]> {
  try {
    const { data } = await client.get("/news/hot");
    return (data.data?.list || data.data || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      summary: item.content || "",
      timestamp: parseInt(item.release_time) || Date.now(),
      coins: extractCoins(item.title + " " + item.content),
      sentiment: undefined,
    }));
  } catch (err: any) {
    console.error("[SoSoValue] fetchHotNews error:", err.message);
    return [];
  }
}

export async function fetchIndexSnapshot(ticker: string) {
  try {
    const { data } = await client.get(`/indices/${ticker}/market-snapshot`);
    return data.data;
  } catch (err: any) {
    console.error(`[SoSoValue] fetchIndexSnapshot(${ticker}) error:`, err.message);
    return null;
  }
}

function extractCoins(text: string): string[] {
  const known = ["BTC", "ETH", "SOL", "BNB", "UNI", "COMP", "PEPE", "ICX"];
  return known.filter((coin) => text.toUpperCase().includes(coin));
}