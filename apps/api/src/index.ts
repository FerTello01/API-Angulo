import cors from '@fastify/cors';
import Fastify from 'fastify';
import { env } from './config/env.js';
import { registerOpenApiDocs } from './plugins/openapi.js';
import { registerCertificateRoutes } from './routes/certificates.routes.js';
import { registerDocsRoutes } from './routes/docs.routes.js';

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'production' ? 'info' : 'debug',
      transport:
        env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
    },
    requestIdHeader: 'x-request-id',
    disableRequestLogging: false,
  });

  await app.register(cors, {
    origin: env.NODE_ENV === 'production' ? env.WEB_APP_URL : true,
    credentials: true,
  });

  await registerOpenApiDocs(app);

  app.get('/health', {
    schema: {
      summary: 'Health check',
      description: 'Verifica que el servicio Proofact API está en ejecución. Útil para load balancers y monitoreo.',
      tags: ['system'],
      response: {
        200: {
          description: 'Servicio operativo',
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['ok'] },
            service: { type: 'string', example: 'proofact-impact-certification-api' },
            timestamp: { type: 'string', format: 'date-time' },
          },
          example: {
            status: 'ok',
            service: 'proofact-impact-certification-api',
            timestamp: '2026-07-12T08:00:00.000Z',
          },
        },
      },
    },
    handler: async () => ({
      status: 'ok',
      service: 'proofact-impact-certification-api',
      timestamp: new Date().toISOString(),
    }),
  });

  await registerCertificateRoutes(app);
  await registerDocsRoutes(app);

  return app;
}

async function main() {
  const app = await buildApp();

  try {
    await app.listen({ port: env.PORT, host: env.HOST });
    app.log.info(`Proofact API listening on ${env.HOST}:${env.PORT}`);
    app.log.info(`OpenAPI reference: http://localhost:${env.PORT}/docs`);
    app.log.info(`Developer guide: ${env.WEB_APP_URL}/developers`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

main();
