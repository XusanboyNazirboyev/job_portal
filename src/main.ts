import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { engine } from 'express-handlebars';
import { join } from 'node:path';
import { json, urlencoded } from 'express';
import methodOverride from 'method-override';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AdminService } from './admin/admin.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const port = process.env.PORT ?? 3000;

  app.use(cookieParser());
  app.use(urlencoded({ extended: true }));
  app.use(json());
  app.use(methodOverride('_method'));
  app.use(
    methodOverride(function (req) {
      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        const method = req.body._method;
        delete req.body._method;
        return method;
      }
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      skipNullProperties: true,
      skipUndefinedProperties: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
        const message = errors
          .map((e) => Object.values(e.constraints || {}).join(', '))
          .join('; ');
        return new BadRequestException(message);
      },
    }),
  );

  app.engine(
    'hbs',
    engine({
      extname: '.hbs',
      defaultLayout: 'main',
      layoutsDir: join(__dirname, '..', 'src', 'views', 'layouts'),
      partialsDir: join(__dirname, '..', 'src', 'views', 'partials'),
      helpers: {
        eq: (a: any, b: any) => a == b,
      },
    }),
  );
  app.setBaseViewsDir(join(__dirname, '..', 'src', 'views'));
  app.setViewEngine('hbs');

  app.useStaticAssets(join(__dirname, '..', 'src', 'public'));
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(port, () => {
    console.log(`listening on ${port}`);
  });
   const adminService = app.get(AdminService);
   await adminService.seedAdmin();
}
bootstrap();
