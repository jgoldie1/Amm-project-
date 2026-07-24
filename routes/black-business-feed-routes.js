"use strict";

const { buildSupportBlackBusinessFeed } = require("../lib/black-business-feed-adapter");

function registerBlackBusinessFeedRoutes({ app, dataSource, requireAuth }) {
  const auth = requireAuth || ((req, _res, next) => {
    if (!req.user) req.user = { id: req.get("x-user-id") || "demo-user" };
    next();
  });

  app.get("/api/black-business/feed", auth, async (req, res) => {
    try {
      const items = await dataSource.listBlackBusinessFeedCandidates({
        city: req.query.city,
        country: req.query.country,
        category: req.query.category,
        liveOnly: req.query.live === "true",
        couponsOnly: req.query.coupons === "true"
      });

      const feed = buildSupportBlackBusinessFeed(items, {
        country: req.query.country,
        city: req.query.city,
        ageLane: req.user.ageLane || "adult",
        blockedBusinessIds: req.user.blockedBusinessIds || [],
        preferLive: req.query.surface === "business-live",
        preferShopLive: req.query.surface === "shop-live",
        preferCoupons: req.query.surface === "coupons",
        africaDiaspora: req.query.surface === "africa-diaspora",
        allowCrossBorder: req.query.crossBorder === "true"
      });

      res.json({
        surface: req.query.surface || "support-black-business",
        count: feed.length,
        items: feed
      });
    } catch (error) {
      console.error("Black business feed failed", error);
      res.status(500).json({ error: "BLACK_BUSINESS_FEED_FAILED" });
    }
  });

  app.get("/api/black-business/cities/:city", auth, async (req, res) => {
    try {
      const items = await dataSource.listBlackBusinessFeedCandidates({
        city: req.params.city,
        country: req.query.country
      });

      res.json({
        city: req.params.city,
        items: buildSupportBlackBusinessFeed(items, {
          city: req.params.city,
          country: req.query.country,
          ageLane: req.user.ageLane || "adult",
          preferCoupons: true
        })
      });
    } catch (error) {
      console.error("Black business city directory failed", error);
      res.status(500).json({ error: "BLACK_BUSINESS_CITY_FAILED" });
    }
  });
}

module.exports = {
  registerBlackBusinessFeedRoutes
};
