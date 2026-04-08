require("dotenv").config({ path: require("path").resolve(__dirname, "../../../.env") });
const { makeApp, readJson, writeJson, nextId, authMiddleware, requireRole, recordAudit, sqlite } = require("@aam/shared");

const PORT = process.env.MARKETPLACE_SERVICE_PORT || 4600;

const app = makeApp("marketplace-service", PORT, (app) => {
  app.post("/seller/apply", authMiddleware, (req, res) => {
    const { storeName, subscriptionTier = "basic" } = req.body;
    if (!storeName) return res.status(400).json({ ok: false, error: "storeName required" });

    const sellers = readJson("sellers.json", []);
    const existing = sellers.find(s => Number(s.ownerUserId) === Number(req.user.sub) && s.storeName === storeName);
    if (existing) return res.status(409).json({ ok: false, error: "seller application already exists" });

    const seller = {
      id: nextId(sellers),
      ownerUserId: Number(req.user.sub),
      storeName,
      email: req.user.email,
      subscriptionTier,
      approved: false,
      createdAt: new Date().toISOString()
    };
    sellers.push(seller);
    writeJson("sellers.json", sellers);

    recordAudit({
      actorUserId: Number(req.user.sub),
      actorRole: req.user.role,
      action: "seller_applied",
      entityType: "seller",
      entityId: seller.id,
      payload: seller
    });

    res.status(201).json({ ok: true, seller });
  });

  app.patch("/sellers/:id/approve", authMiddleware, requireRole("admin"), (req, res) => {
    const sellers = readJson("sellers.json", []);
    const seller = sellers.find((s) => s.id === Number(req.params.id));
    if (!seller) return res.status(404).json({ ok: false, error: "seller not found" });
    if (seller.approved) return res.status(409).json({ ok: false, error: "seller already approved" });

    seller.approved = true;
    seller.approvedAt = new Date().toISOString();
    writeJson("sellers.json", sellers);

    const db = sqlite();
    db.prepare(`
      INSERT INTO seller_approvals (seller_id, admin_user_id, approved_at)
      VALUES (?, ?, ?)
    `).run(seller.id, Number(req.user.sub), seller.approvedAt);

    recordAudit({
      actorUserId: Number(req.user.sub),
      actorRole: req.user.role,
      action: "seller_approved",
      entityType: "seller",
      entityId: seller.id,
      payload: seller
    });

    res.json({ ok: true, seller });
  });

  app.get("/sellers", (_req, res) => {
    const sellers = readJson("sellers.json", []);
    res.json({ ok: true, sellers });
  });

  app.post("/products", authMiddleware, (req, res) => {
    const { sellerId, name, price, category = "general", inventory = 0 } = req.body;
    if (!sellerId || !name || price == null) {
      return res.status(400).json({ ok: false, error: "sellerId, name, price required" });
    }

    const sellers = readJson("sellers.json", []);
    const seller = sellers.find(s => s.id === Number(sellerId));
    if (!seller) return res.status(404).json({ ok: false, error: "seller not found" });
    if (!seller.approved) return res.status(403).json({ ok: false, error: "seller not approved" });

    const products = readJson("products.json", []);
    const existing = products.find(p =>
      Number(p.sellerId) === Number(sellerId) &&
      String(p.name).toLowerCase() === String(name).toLowerCase()
    );
    if (existing) return res.status(409).json({ ok: false, error: "duplicate product for seller" });

    const product = {
      id: nextId(products),
      sellerId: Number(sellerId),
      name,
      price: Number(price),
      category,
      inventory: Number(inventory),
      createdAt: new Date().toISOString()
    };
    products.push(product);
    writeJson("products.json", products);

    recordAudit({
      actorUserId: Number(req.user.sub),
      actorRole: req.user.role,
      action: "product_created",
      entityType: "product",
      entityId: product.id,
      payload: product
    });

    res.status(201).json({ ok: true, product });
  });

  app.get("/products", (_req, res) => {
    const products = readJson("products.json", []);
    res.json({ ok: true, products });
  });
});

app.listen(PORT, () => {
  console.log(`Marketplace Service running on http://127.0.0.1:${PORT}`);
});
