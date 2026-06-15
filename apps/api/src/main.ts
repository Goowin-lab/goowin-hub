import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import 'reflect-metadata';

import { AppModule } from './app.module';
import { AppLoggerService } from './logger/app-logger.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);
  const logger = app.get(AppLoggerService);
  app.useLogger(logger);

  const globalPrefix = configService.get<string>('app.globalPrefix', 'api');
  app.setGlobalPrefix(globalPrefix);

  app.enableCors({
    origin: configService.get<string>('app.corsOrigin', '*'),
  });

  app.useGlobalPipes(
    new ValidationPipe({
      forbidUnknownValues: true,
      transform: true,
      whitelist: true,
    }),
  );

  const swaggerEnabled = configService.get<boolean>('swagger.enabled', true);
  if (swaggerEnabled) {
    const swaggerPath = configService.get<string>('swagger.path', 'docs');
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Goowin Hub API')
      .setDescription('Backend infrastructure base for Goowin Hub.')
      .setVersion('0.1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(swaggerPath, app, document);
  }

  const port = configService.get<number>('app.port', 3000);
  await app.listen(port);

  Logger.log(
    `Goowin Hub API running on port ${port} with global prefix "${globalPrefix}"`,
    'Bootstrap',
  );
}

void bootstrap();
