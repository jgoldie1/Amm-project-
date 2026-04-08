require("dotenv").config({ path: require("path").resolve(__dirname, "../../../.env") });
const { makeApp, readJson, writeJson, nextId, authMiddleware, recordAudit } = require("@aam/shared");

const PORT = process.env.CROSSBORDER_SERVICE_PORT || 5200;

function getRate(from, to) {
  if (from === to) return 1;
  const rates = {
    "USD:EUR": 0.92,
    "USD:GBP": 0.79,
    "USD:JMD": 156,
    "USD:NGN": 1500
  };
  return rates[`${from}:${to}`] || 1.1;
}

const app = makeApp("crossborder-service", PORT, (app) => {
  app.get("/fx/quote", (req, res) => {
    const from = req.query.from || "USD";
    const to = req.query.to || "EUR";
    const amount = Number(req.query.amount || 1);
    const rate = getRate(from, to);

    const quotes = readJson("fx_quotes.json", []);
    const quote = {
      id: nextId(quotes),
      from,
      to,
      amount,
      rate,
      convertedAmount: Number((amount * rate).toFixed(2)),
      createdAt: new Date().toISOString()
    };

    quotes.push(quote);
    writeJson("fx_quotes.json", quotes);

    res.json({ ok: true, quote });
  });

  app.post("/remittance/request", authMiddleware, (req, res) => {
    const {
      recipientName,
      recipientCountry,
      fromCurrency = "USD",
      toCurrency = "EUR",
      amount
    } = req.body;

    if (!recipientName || !recipientCountry || !amount) {
      return res.status(400).json({ ok: false, error: "recipientName, recipientCountry, amount required" });
    }

    const rate = getRate(fromCurrency, toCurrency);
    const requests = readJson("remittance_requests.json", []);
    const remittance = {
      id: nextId(requests),
      userId: Number(req.user.sub),
      recipientName,
      recipientCountry,
      fromCurrency,
      toCurrency,
      amount: Number(amount),
      rate,
      convertedAmount: Number((Number(amount) * rate).toFixed(2)),
      status: "requested",
      createdAt: new Date().toISOString()
    };

    requests.push(remittance);
    writeJson("remittance_requests.json", requests);

    recordAudit({
      actorUserId: Number(req.user.sub),
      actorRole: req.user.role,
      action: "remittance_requested",
      entityType: "remittance",
      entityId: remittance.id,
      payload: remittance
    });

    res.status(201).json({ ok: true, remittance });
  });
});

app.listen(PORT, () => {
  console.log(`CrossBorder Service running on http://127.0.0.1:${PORT}`);
});
