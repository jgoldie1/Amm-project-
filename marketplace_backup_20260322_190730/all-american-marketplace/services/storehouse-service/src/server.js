require("dotenv").config({ path: require("path").resolve(__dirname, "../../../.env") });
const { makeApp, readJson, writeJson, nextId, authMiddleware, requireRole, recordAudit } = require("@aam/shared");

const PORT = process.env.STOREHOUSE_SERVICE_PORT || 5000;

function getFileByKind(kind) {
  if (kind === "grocery") return "grocery_items.json";
  if (kind === "book") return "book_items.json";
  return "store_items.json";
}

const app = makeApp("storehouse-service", PORT, (app) => {
  app.get("/storehouse/items", (_req, res) => {
    res.json({
      ok: true,
      store: readJson("store_items.json", []),
      grocery: readJson("grocery_items.json", []),
      books: readJson("book_items.json", [])
    });
  });

  app.post("/storehouse/items", authMiddleware, requireRole("admin"), (req, res) => {
    const {
      kind = "store",
      name,
      price,
      inventory = 0,
      format = "physical",
      description = "",
      author = "",
      category = ""
    } = req.body;

    if (!name || price == null) {
      return res.status(400).json({ ok: false, error: "name, price required" });
    }

    const file = getFileByKind(kind);
    const items = readJson(file, []);

    const duplicate = items.find(
      x =>
        String(x.name).toLowerCase() === String(name).toLowerCase() &&
        String(x.format || "").toLowerCase() === String(format || "").toLowerCase()
    );

    if (duplicate) {
      return res.status(409).json({ ok: false, error: "duplicate item exists" });
    }

    const item = {
      id: nextId(items),
      kind,
      name,
      price: Number(price),
      inventory: Number(inventory),
      format,
      description,
      author,
      category,
      createdAt: new Date().toISOString()
    };

    items.push(item);
    writeJson(file, items);

    recordAudit({
      actorUserId: Number(req.user.sub),
      actorRole: req.user.role,
      action: "storehouse_item_created",
      entityType: "store_item",
      entityId: item.id,
      payload: item
    });

    res.status(201).json({ ok: true, item });
  });
});

app.listen(PORT, () => {
  console.log(`Storehouse Service running on http://127.0.0.1:${PORT}`);
});
