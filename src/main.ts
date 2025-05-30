import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { CustomValidationExceptionFilter } from './common/exceptions/custom-validation-exception.filter';
import { CustomValidationPipe } from './common/exceptions/custom-validation-pipe.filter';
import { HttpExceptionFilter } from './common/exceptions/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { config } from './config/config';

const { port } = config;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: false,
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'blob:'],
        },
      },
    }),
  );
  const logger = new Logger('Bootstrap');
  const reflector = new Reflector();
  // app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useWebSocketAdapter(new WsAdapter(app));
  // app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalFilters(new CustomValidationExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalInterceptors(new ResponseInterceptor(reflector));

  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('PoC Server')
    .setDescription('PoC-APIs')
    .setVersion('1.0')
    .addTag('PoC')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(port ?? 3000);
  logger.log(`Chatbot server is running on http://localhost:${port ?? 3000}`);
}
bootstrap();
