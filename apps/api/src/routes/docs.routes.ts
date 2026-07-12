import type { FastifyInstance } from 'fastify';
import { env } from '../config/env.js';

export async function registerDocsRoutes(app: FastifyInstance): Promise<void> {
  const guideUrl = `${env.WEB_APP_URL}/developers`;

  app.get('/', {
    schema: { hide: true },
    handler: async (_request, reply) => {
      return reply.redirect(guideUrl);
    },
  });

  app.get('/guide', {
    schema: { hide: true },
    handler: async (_request, reply) => {
      return reply.redirect(guideUrl);
    },
  });

  app.get('/openapi.json', {
    schema: { hide: true },
    handler: async (_request, reply) => {
      return reply.send(app.swagger());
    },
  });
}
