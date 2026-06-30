import express from 'express';
import cors from 'cors';
import { authRateLimit, generalRateLimit } from './middleware/rateLimit.js';
import { logger } from './lib/logger.js';

import authRoutes from './routes/auth.js';
import profilesRoutes from './routes/profiles.js';
import licensesRoutes from './routes/licenses.js';
import certificationsRoutes from './routes/certifications.js';
import connectionsRoutes from './routes/connections.js';
import feedRoutes from './routes/feed.js';
import endorsementsRoutes from './routes/endorsements.js';
import recommendationsRoutes from './routes/recommendations.js';
import jobsRoutes from './routes/jobs.js';
import applicationsRoutes from './routes/applications.js';
import messagesRoutes from './routes/messages.js';
import notificationsRoutes from './routes/notifications.js';
import searchRoutes from './routes/search.js';
import verificationsRoutes from './routes/verifications.js';
import subscriptionsRoutes from './routes/subscriptions.js';
import webhooksRoutes from './routes/webhooks.js';

const app = express();

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:5173'],
  credentials: true,
}));

app.use('/webhooks', express.raw({ type: 'application/json' }));
app.use(express.json());

app.use('/auth', authRateLimit, authRoutes);
app.use('/profiles', generalRateLimit, profilesRoutes);
app.use('/licenses', generalRateLimit, licensesRoutes);
app.use('/certifications', generalRateLimit, certificationsRoutes);
app.use('/connections', generalRateLimit, connectionsRoutes);
app.use('/feed', generalRateLimit, feedRoutes);
app.use('/endorsements', generalRateLimit, endorsementsRoutes);
app.use('/recommendations', generalRateLimit, recommendationsRoutes);
app.use('/jobs', generalRateLimit, jobsRoutes);
app.use('/applications', generalRateLimit, applicationsRoutes);
app.use('/messages', generalRateLimit, messagesRoutes);
app.use('/notifications', generalRateLimit, notificationsRoutes);
app.use('/search', generalRateLimit, searchRoutes);
app.use('/verifications', generalRateLimit, verificationsRoutes);
app.use('/subscriptions', generalRateLimit, subscriptionsRoutes);
app.use('/webhooks', webhooksRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => logger.info(`FilLinked API running on port ${PORT}`));

export default app;
