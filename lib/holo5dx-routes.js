const { getHardwareProfile, createRenderPlan, createCalibration } = require('./holo5dx-core');

function registerHolo5dxRoutes({ app }) {
  app.get('/api/holo5dx/status', (_req, res) => {
    res.json({ name: 'Holo5DX', version: '0.2.0', runtime: 'control-plane', productionRenderer: false });
  });

  app.get('/api/holo5dx/hardware/:id', (req, res) => {
    res.json(getHardwareProfile(req.params.id));
  });

  app.post('/api/holo5dx/render-plan', (req, res) => {
    try { res.json(createRenderPlan(req.body || {})); }
    catch (error) { res.status(400).json({ error: error.message }); }
  });

  app.post('/api/holo5dx/calibration', (req, res) => {
    try { res.status(201).json(createCalibration(req.body || {})); }
    catch (error) { res.status(400).json({ error: error.message }); }
  });
}

module.exports = { registerHolo5dxRoutes };
