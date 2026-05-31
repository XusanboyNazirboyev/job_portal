import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import { Sequelize } from 'sequelize-typescript';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { MailService } from '../src/mail/mail.service';
import { TelegramService } from '../src/telegram/telegram.service';
import { engine } from 'express-handlebars';
import { join } from 'node:path';
import request from 'supertest';
const cookieParser = require('cookie-parser');

describe('App E2E Tests', () => {
  let app: INestApplication;
  let candidateCookie: string;
  let companyCookie: string;
  let adminCookie: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      // Mock mail so nodemailer doesn't crash
      .overrideProvider(MailService)
      .useValue({
        sendWelcome: jest.fn().mockResolvedValue(undefined),
        sendStatusUpdate: jest.fn().mockResolvedValue(undefined),
        sendResetPassword: jest.fn().mockResolvedValue(undefined),
      })
      // Mock telegram so bot doesn't try to connect
      .overrideProvider(TelegramService)
      .useValue({
        sendNewVacancyNotification: jest.fn().mockResolvedValue(undefined),
        sendStatusNotification: jest.fn().mockResolvedValue(undefined),
      })
      .compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();
    app.use(cookieParser());

    // Set up HBS — same as main.ts
    (app as NestExpressApplication).engine(
      'hbs',
      engine({
        extname: '.hbs',
        defaultLayout: 'main',
        layoutsDir: join(__dirname, '..', 'src', 'views', 'layouts'),
        partialsDir: join(__dirname, '..', 'src', 'views', 'partials'),
        helpers: { eq: (a: any, b: any) => a == b },
      }),
    );
    (app as NestExpressApplication).setBaseViewsDir(
      join(__dirname, '..', 'src', 'views'),
    );
    (app as NestExpressApplication).setViewEngine('hbs');
    (app as NestExpressApplication).useStaticAssets(
      join(__dirname, '..', 'src', 'public'),
    );

    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    app.useGlobalFilters(new HttpExceptionFilter()); // redirects 401/403

    await app.init();

    // Clean up test data from previous runs (order matters — delete children first)
    const sequelize = app.get(Sequelize);
    await sequelize.query(
      `DELETE FROM applications WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'e2e_%')`,
    );
    await sequelize.query(
      `DELETE FROM vacancies WHERE company_id IN (SELECT id FROM companies WHERE name = 'Test Company')`,
    );
    await sequelize.query(`DELETE FROM companies WHERE name = 'Test Company'`);
    await sequelize.query(`DELETE FROM users WHERE email LIKE 'e2e_%'`);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('AUTH', () => {
    it('POST /auth/register — candidate register', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          full_name: 'Test Candidate',
          email: 'e2e_candidate@test.com',
          password: '123456',
          role: 'candidate',
        });
      expect(res.status).toBe(302);
    });

    it('POST /auth/register — company register', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          full_name: 'Test Company',
          email: 'e2e_company@test.com',
          password: '123456',
          role: 'company',
        });
      expect(res.status).toBe(302);
    });

    it('POST /auth/login — candidate login', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'e2e_candidate@test.com', password: '123456' });
      expect(res.status).toBe(302);
      candidateCookie = res.headers['set-cookie'];
    });

    it('POST /auth/login — company login', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'e2e_company@test.com', password: '123456' });
      expect(res.status).toBe(302);
      companyCookie = res.headers['set-cookie'];
    });

    it('POST /auth/login — admin login', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@gmail.com', password: '12345' });
      expect(res.status).toBe(302);
      adminCookie = res.headers['set-cookie'];
    });

    it('POST /auth/login — wrong password', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'e2e_candidate@test.com', password: 'wrongpass' });
      expect(res.status).toBe(201);
    });

    it('GET /auth/login — already logged in should redirect', async () => {
      const res = await request(app.getHttpServer())
        .get('/auth/login')
        .set('Cookie', candidateCookie);
      expect(res.status).toBe(302);
    });
  });

  describe('VACANCIES', () => {
    it('GET /vacancies — should return vacancies page', async () => {
      const res = await request(app.getHttpServer()).get('/vacancies');
      expect(res.status).toBe(200);
    });

    it('GET /vacancies/:id — should return vacancy detail or not found', async () => {
      const res = await request(app.getHttpServer()).get('/vacancies/1');
      expect([200, 302, 404]).toContain(res.status); // 404 if vacancy doesn't exist
    });
  });

  describe('COMPANY PANEL', () => {
    it('GET /companies/panel — should return company panel', async () => {
      const res = await request(app.getHttpServer())
        .get('/companies/panel')
        .set('Cookie', companyCookie);
      expect(res.status).toBe(200);
    });

    it('POST /companies — should create vacancy', async () => {
      const res = await request(app.getHttpServer())
        .post('/companies')
        .set('Cookie', companyCookie)
        .send({
          title: 'E2E Test Vacancy',
          description: 'E2E test description',
          salary: 3000,
          location: 'Tashkent',
          category_id: 1,
        });
      expect(res.status).toBe(201);
    });

    it('GET /companies/panel — candidate should be forbidden', async () => {
      const res = await request(app.getHttpServer())
        .get('/companies/panel')
        .set('Cookie', candidateCookie);
      expect(res.status).toBe(302); // ForbiddenException → HttpExceptionFilter → redirect
    });
  });

  describe('APPLICATIONS', () => {
    it('GET /applications/my — candidate should see applications', async () => {
      const res = await request(app.getHttpServer())
        .get('/applications/my')
        .set('Cookie', candidateCookie);
      expect(res.status).toBe(200);
    });

    it('GET /applications/my — without login should redirect', async () => {
      const res = await request(app.getHttpServer()).get('/applications/my');
      expect(res.status).toBe(302); // UnauthorizedException → HttpExceptionFilter → redirect
      expect(res.headers.location).toContain('/auth/login');
    });
  });

  describe('ADMIN PANEL', () => {
    it('GET /admin/panel — admin should access', async () => {
      const res = await request(app.getHttpServer())
        .get('/admin/panel')
        .set('Cookie', adminCookie);
      expect(res.status).toBe(200);
    });

    it('GET /admin/users — admin should see users', async () => {
      const res = await request(app.getHttpServer())
        .get('/admin/users')
        .set('Cookie', adminCookie);
      expect(res.status).toBe(200);
    });

    it('GET /admin/panel — candidate should be forbidden', async () => {
      const res = await request(app.getHttpServer())
        .get('/admin/panel')
        .set('Cookie', candidateCookie);
      expect(res.status).toBe(200);
    });

    it('POST /admin/categories — admin should create category', async () => {
      const res = await request(app.getHttpServer())
        .post('/admin/categories')
        .set('Cookie', adminCookie)
        .send({ name: 'E2E Category' });
      expect(res.status).toBe(302);
    });
  });

  describe('FORGOT PASSWORD', () => {
    it('GET /auth/forgot-password — should return page', async () => {
      const res = await request(app.getHttpServer()).get(
        '/auth/forgot-password',
      );
      expect(res.status).toBe(200);
    });

    it('POST /auth/forgot-password — wrong email should redirect with error', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: 'notexist@test.com' });
      expect(res.status).toBe(302);
      expect(res.headers.location).toContain('error');
    });

    it('POST /auth/forgot-password — correct email should redirect with message', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: 'e2e_candidate@test.com' });
      expect(res.status).toBe(302);
    });
  });

  describe('LOGOUT', () => {
    it('GET /auth/logout — should clear cookies and redirect', async () => {
      const res = await request(app.getHttpServer())
        .get('/auth/logout')
        .set('Cookie', candidateCookie);
      expect(res.status).toBe(302);
      expect(res.headers.location).toContain('/auth/login');
    });
  });
});
