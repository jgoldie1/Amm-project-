"use strict";

function registerBusinessCommerceRoutes({ app, service, requireAuth, requireBusinessOwner }) {
  const auth = requireAuth || ((req, _res, next) => next());
  const owner = requireBusinessOwner || auth;

  app.post("/api/businesses", auth, async (req, res) => {
    try {
      const business = await service.createBusiness({ ownerId: req.user.id, ...req.body });
      res.status(201).json(business);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/businesses/:businessId/storefronts", owner, async (req, res) => {
    try {
      const storefront = await service.createStorefront({ businessId: req.params.businessId, ...req.body });
      res.status(201).json(storefront);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/storefronts/:storefrontId/products", owner, async (req, res) => {
    try {
      const product = await service.addProduct({ storefrontId: req.params.storefrontId, ...req.body });
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/businesses/:businessId/menus", owner, async (req, res) => {
    try {
      const menu = await service.createRestaurantMenu({ businessId: req.params.businessId, ...req.body });
      res.status(201).json(menu);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/menus/:menuId/items", owner, async (req, res) => {
    try {
      const item = await service.addMenuItem({ menuId: req.params.menuId, ...req.body });
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/commerce/orders", auth, async (req, res) => {
    try {
      const result = await service.createOrder({ customerId: req.user.id, ...req.body });
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/internal/commerce/orders/:orderId/settle", async (req, res) => {
    try {
      const result = await service.settleVerifiedOrder({ orderId: req.params.orderId, ...req.body });
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
}

module.exports = { registerBusinessCommerceRoutes };
