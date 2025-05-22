import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json, raw } from 'body-parser';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: '*' });
  app.use(helmet());
  app.useGlobalPipes(new ValidationPipe());

  app.use(
    '/purchases/confirm-payment/webhook',
    raw({ type: 'application/json' }),
  );

  app.use(json());

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3001;

  const config = new DocumentBuilder()
    .setTitle('Event management API')
    .setDescription(
      `**REST** API for managing and selling event tickets, designed to serve both **partners** (event organizers) and **customers** (ticket buyers).\
      The API allows partners to create and manage events and their tickets, while customers can view events, make purchases and manage their orders.`,
    )
    .setVersion('0.0.1')
    .addTag('tickets')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(port);
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
