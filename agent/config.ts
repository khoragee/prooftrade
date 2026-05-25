import dotenv from "dotenv";
dotenv.config();

export const config = {
  sosovalue: {
    baseUrl: "https://openapi.sosovalue.com/openapi/v1",
    apiKey: process.env.SOSOVALUE_API_KEY || "",
  },
  sodex: {
    baseUrl: process.env.SODEX_TESTNET === "true"
      ? "https://testnet-gw.sodex.dev/api/v1/spot"
      : "https://mainnet-gw.sodex.dev/api/v1/spot",
    apiKeyName: process.env.SODEX_API_KEY_NAME || "",
    privateKey: process.env.SODEX_API_PRIVATE_KEY || "",
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY || "",
    model: "claude-sonnet-4-20250514",
  },
  app: {
    port: parseInt(process.env.PORT || "3000"),
    pollIntervalMs: parseInt(process.env.POLL_INTERVAL_MS || "60000"),
  },
};
