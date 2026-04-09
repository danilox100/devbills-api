import cors from '@fastify/cors';
import Fastify, { type FastifyInstance } from 'fastify';
import { env } from './config/env.js';
import routes from './routes/index.js';

const app: FastifyInstance = Fastify({
  logger: {
    level: env.NODE_ENV === 'dev' ? 'info' : 'error',
  },
});

app.register(cors);

app.register(routes, { prefix: '/api' });

export default app;
