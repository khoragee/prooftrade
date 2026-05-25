import express from "express";
import { config } from "../agent/config";
import { store } from "../agent/store";
import { Strategy, Subscriber } from "../agent/types";
import { randomUUID } from "crypto";

const app = express();
app.use(express.json());

// CORS for frontend
app.use((_, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// --- Strategies ---
app.get("/strategies", (_, res) => {
  res.json(store.getAllStrategies());
});

app.post("/strategies", (req, res) => {
  const s: Strategy = { ...req.body, id: randomUUID(), createdAt: Date.now() };
  store.addStrategy(s);
  res.json(s);
});

// --- Subscribers ---
app.post("/strategies/:id/subscribe", (req, res) => {
  const sub: Subscriber = {
    ...req.body,
    id: randomUUID(),
    strategyId: req.params.id,
  };
  store.addSubscriber(sub);
  res.json(sub);
});

app.get("/strategies/:id/subscribers", (req, res) => {
  res.json(store.getSubscribers(req.params.id));
});

// --- Trade history ---
app.get("/trades", (req, res) => {
  res.json(store.getTrades(req.query.strategyId as string));
});

app.get("/trades/:strategyId/stats", (req, res) => {
  const trades = store.getTrades(req.params.strategyId);
  const filled = trades.flatMap((t) => t.orders).filter((o) => o.status === "FILLED");
  res.json({
    totalTrades: trades.length,
    filledOrders: filled.length,
    lastTrade: trades[trades.length - 1]?.executedAt || null,
  });
});

// --- Health ---
app.get("/health", (_, res) => res.json({ status: "ok", ts: Date.now() }));

app.listen(config.app.port, () => {
  console.log(`🌐 API server on http://localhost:${config.app.port}`);
});

export default app;
