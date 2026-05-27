import { Injectable } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import Handlebars from 'handlebars';

@Injectable()
export class MailService {
  private transport: Transporter;

  constructor() {
    this.transport = createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GOOGLE_EMAIL,
        pass: process.env.GOOGLE_APP_PASSWORD,
      },
    });
  }

  private compile(templateName: string, context: object): string {
    const templatePath = join(
      __dirname,
      '..',
      '..',
      'src',
      'views',
      'mails',
      `${templateName}.hbs`,
    );
    const source = readFileSync(templatePath, 'utf-8');
    return Handlebars.compile(source)(context);
  }

  async sendWelcome(email: string, name: string) {
    const html = this.compile('welcome', { name });
    await this.transport.sendMail({
      to: email,
      subject: 'Job Portal ga xush kelibsiz!',
      html,
    });
  }

  async sendStatusUpdate(
    email: string,
    name: string,
    status: string,
    vacancyTitle: string,
  ) {
    const html = this.compile('status', { name, status, vacancyTitle });
    await this.transport.sendMail({
      to: email,
      subject: "Arizangiz holati o'zgardi",
      html,
    });
  }
}
