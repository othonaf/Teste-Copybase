import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(
    cors({
      origin: 'https://copybase-othons-projects.vercel.app', //'http://localhost:3000'
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      allowedHeaders: '*',
    }),
  );
  await app.listen(process.env.PORT || 3003);
}
bootstrap();
