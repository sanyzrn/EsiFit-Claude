import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config.js';
import { runMigrations } from './migrate.js';
import { authRouter } from './routes/auth.js';
import { usersRouter } from './routes/users.js';
import { activityRouter } from './routes/activity.js';
import { paymentsRouter, stripeWebhookRouter } from './routes/payments.js';
import { adminRouter } from './routes/admin.js';

const app = express();

app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));

// Stripe webhook must receive raw body — mount before json parser
app.use('/api/webhooks/stripe', stripeWebhookRouter);

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/activity', activityRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/admin', adminRouter);

async function start() {
  await runMigrations();
  app.listen(config.port, () => {
    console.info(`EsiFit API listening on http://localhost:${config.port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start API:', err);
  process.exit(1);
});
