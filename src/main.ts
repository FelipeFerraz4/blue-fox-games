import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from '@nestjs/common';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Protótipo: o próprio backend serve o cliente estático (public/).
  // Quando houver frontend Angular, ele passa a ser um container separado.
  // `extensions` permite URLs limpas: /sobre → sobre.html, /memoria → memoria.html.
  app.useStaticAssets(join(__dirname, '..', 'public'), { extensions: ['html'] });

  const port = Number(process.env.PORT) || 3001;
  await app.listen(port, '0.0.0.0');
  new Logger('Bootstrap').log(`🎮 Blue Fox Games em http://localhost:${port}`);
}

bootstrap();
