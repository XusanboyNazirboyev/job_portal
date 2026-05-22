import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { engine } from 'express-handlebars';
import { join } from 'node:path';
import { json, urlencoded } from 'express';


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const port = process.env.PORT ?? 3000;

  app.use(cookieParser());
  app.use(urlencoded({extended:true}))
  app.use(json())

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      skipNullProperties: true,
      skipUndefinedProperties: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.engine(
    'hbs',
    engine({
      extname: '.hbs',
      defaultLayout: 'main',
      layoutsDir: join(__dirname, '..', 'src', 'views', 'layouts'),
      partialsDir: join(__dirname, '..', 'src', 'views', 'partials'),
    }),
  );
  app.setBaseViewsDir(join(__dirname, '..', 'src', 'views'));
  app.setViewEngine('hbs');

  app.useStaticAssets(join(__dirname, '..', 'src', 'public'));
  await app.listen(port, () => {
    console.log(`listening on ${port}`);
  });
}
bootstrap();
