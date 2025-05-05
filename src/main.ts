import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json, raw } from 'body-parser';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: '*' });
  app.useGlobalPipes(new ValidationPipe());

  app.use(
    '/purchases/confirm-payment/webhook',
    raw({ type: 'application/json' }),
  );

  app.use(json());

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3001;

  const config = new DocumentBuilder()
    .setTitle('API manage tickets')
    .setDescription('The cats API description')
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
