require("dotenv").config({ path: require("path").resolve(__dirname, "../../../.env") });
const { makeApp, readJson, writeJson, nextId, authMiddleware, recordAudit } = require("@aam/shared");

const PORT = process.env.FINBANK_SERVICE_PORT || 5100;

function getWallets() {
  return readJson("wallet_accounts.json", []);
}

function saveWallets(wallets) {
  writeJson("wallet_accounts.json", wallets);
}

function ensureWallet(userId, currency = "USD") {
  const wallets = getWallets();
  let wallet = wallets.find(w => Number(w.userId) === Number(userId) && w.currency === currency);

  if (!wallet) {
    wallet = {
      id: nextId(wallets),
      userId: Number(userId),
      currency,
      balance: 0,
      createdAt: new Date().toISOString()
    };
    wallets.push(wallet);
    saveWallets(wallets);
  }

  return wallet;
}

const app = makeApp("finbank-service", PORT, (app) => {
  app.post("/wallets/open", authMiddleware, (req, res) => {
    const { currency = "USD" } = req.body;
    const wallet = ensureWallet(req.user.sub, currency);
    res.status(201).json({ ok: true, wallet });
  });

  app.get("/wallets/my", authMiddleware, (req, res) => {
    const wallets = getWallets().filter(w => Number(w.userId) === Number(req.user.sub));
    res.json({ ok: true, wallets });
  });

  app.post("/wallets/credit", authMiddleware, (req, res) => {
    const { currency = "USD", amount } = req.body;
    if (!amount) {
      return res.status(400).json({ ok: false, error: "amount required" });
    }

    const wallets = getWallets();
    let wallet = wallets.find(w => Number(w.userId) === Number(req.user.sub) && w.currency === currency);

    if (!wallet) {
      wallet = {
        id: nextId(wallets),
        userId: Number(req.user.sub),
        currency,
        balance: 0,
        createdAt: new Date().toISOString()
      };
      wallets.push(wallet);
    }

    wallet.balance = Number((Number(wallet.balance) + Number(amount)).toFixed(2));
    saveWallets(wallets);

    recordAudit({
      actorUserId: Number(req.user.sub),
      actorRole: req.user.role,
      action: "wallet_credited",
      entityType: "wallet",
      entityId: wallet.id,
      payload: { amount: Number(amount), currency }
    });

    res.json({ ok: true, wallet });
  });

  app.post("/wallets/transfer", authMiddleware, (req, res) => {
    const { toUserId, amount, currency = "USD", note = "" } = req.body;
    if (!toUserId || !amount) {
      return res.status(400).json({ ok: false, error: "toUserId, amount required" });
    }

    const wallets = getWallets();
    let from = wallets.find(w => Number(w.userId) === Number(req.user.sub) && w.currency === currency);
    let to = wallets.find(w => Number(w.userId) === Number(toUserId) && w.currency === currency);

    if (!from) return res.status(404).json({ ok: false, error: "sender wallet not found" });
    if (Number(from.balance) < Number(amount)) {
      return res.status(409).json({ ok: false, error: "insufficient balance" });
    }

    if (!to) {
      to = {
        id: nextId(wallets),
        userId: Number(toUserId),
        currency,
        balance: 0,
        createdAt: new Date().toISOString()
      };
      wallets.push(to);
    }

    from.balance = Number((Number(from.balance) - Number(amount)).toFixed(2));
    to.balance = Number((Number(to.balance) + Number(amount)).toFixed(2));
    saveWallets(wallets);

    const transfers = readJson("transfers.json", []);
    const transfer = {
      id: nextId(transfers),
      fromUserId: Number(req.user.sub),
      toUserId: Number(toUserId),
      amount: Number(amount),
      currency,
      note,
      createdAt: new Date().toISOString()
    };
    transfers.push(transfer);
    writeJson("transfers.json", transfers);

    recordAudit({
      actorUserId: Number(req.user.sub),
      actorRole: req.user.role,
      action: "wallet_transfer",
      entityType: "transfer",
      entityId: transfer.id,
      payload: transfer
    });

    res.json({ ok: true, transfer, from, to });
  });
});

app.listen(PORT, () => {
  console.log(`FinBank Service running on http://127.0.0.1:${PORT}`);
});
