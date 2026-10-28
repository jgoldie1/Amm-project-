import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { api } from './routes/api.js';

const app = express();
app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || true, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use('/api', api);

const root = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(root, 'public')));
app.get('/health', (_req, res) => res.json({ ok: true, service: 'tryamm-google-play-safety-layer' }));
app.get('*', (_req, res) => res.sendFile(path.join(root, 'public', 'index.html')));

const port = Number(process.env.PORT || 8787);
if (process.env.NODE_ENV !== 'test') app.listen(port, () => console.log(`TryAMM safety layer listening on ${port}`));

export default app;
