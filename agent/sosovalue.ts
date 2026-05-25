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
    return (data.data || []).map((item: any) => ({
      id: item.id || String(item.timestamp),
      title: item.title,
      summary: item.summary || item.content || "",
      timestamp: item.timestamp || Date.now(),
      coins: item.coins || item.symbols || [],
      sentiment: item.sentiment,
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
