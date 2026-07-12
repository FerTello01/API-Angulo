import cors from '@fastify/cors';
import Fastify from 'fastify';
import { env } from './config/env.js';
import { registerCertificateRoutes } from './routes/certificates.routes.js';

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
    origin: env.NODE_ENV === 'production' ? false : true,
  });

  app.get('/health', async () => ({
    status: 'ok',
    service: 'impact-certification-api',
    timestamp: new Date().toISOString(),
  }));

  await registerCertificateRoutes(app);

  return app;
}

async function main() {
  const app = await buildApp();

  try {
    await app.listen({ port: env.PORT, host: env.HOST });
    app.log.info(`Impact Certification API listening on ${env.HOST}:${env.PORT}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

main();
