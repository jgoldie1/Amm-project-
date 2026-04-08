const express = require('express');
const bodyParser = require('body-parser');

const identity = require('../services/identity');
const wallet = require('../services/wallet');
const music = require('../services/music');
const moderation = require('../services/moderation');
const ads = require('../services/ads');
const ai = require('../services/ai');

const app = express();
app.use(bodyParser.json());

// health
app.get('/health', (req,res)=>res.json({ok:true, service:'gateway'}));

// identity
app.post('/identity/signup', identity.signup);
app.post('/identity/verify', identity.verify);

// wallet
app.post('/wallet/deposit', wallet.deposit);
app.post('/wallet/transfer', wallet.transfer);
app.get('/wallet/:userId', wallet.getWallet);

// music + remix flags
app.post('/music/upload', music.upload);
app.post('/music/stream', music.streamEvent);

// dmca/report/appeal
app.post('/moderation/report', moderation.report);
app.post('/moderation/dmca', moderation.dmcaNotice);
app.post('/moderation/appeal', moderation.appeal);

// ads
app.post('/ads/impression', ads.impression);

// ai
app.post('/ai/evaluate-stream', ai.evaluateStream);

const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=> console.log('AAM Gateway on :'+PORT));
