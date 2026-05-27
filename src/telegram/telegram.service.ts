import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Telegraf } from 'telegraf';
import { User } from '../users/models/user.model';
import { Vacancy } from '../vacancies/models/vacancy.model';
import { Application } from '../applications/models/application.model';

@Injectable()
export class TelegramService implements OnModuleInit {
  private bot: Telegraf;

  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(Vacancy) private readonly vacancyModel: typeof Vacancy,
    @InjectModel(Application)
    private readonly applicationModel: typeof Application,
  ) {
    this.bot = new Telegraf(process.env.BOT_TOKEN!);
  }

  async onModuleInit() {
    this.bot.start(async (ctx) => {
      const telegramId = String(ctx.from.id);
      await this.userModel.update(
        { telegram_id: telegramId },
        { where: { telegram_id: null } },
      );
      await ctx.reply(
        `Salom ${ctx.from.first_name}! Job Portal botga xush kelibsiz!\n\n` +
          `/jobs — vacancylar\n` +
          `/myapplications — mening arizalarim\n` +
          `/help — yordam`,
      );
    });

    this.bot.command('jobs', async (ctx) => {
      const vacancies = await this.vacancyModel.findAll({ limit: 10 });
      if (!vacancies.length) {
        return ctx.reply("Hozircha vacancy yo'q");
      }
      const text = vacancies
        .map(
          (v, i) =>
            `${i + 1}. ${v.getDataValue('title')} — ${v.getDataValue('location')} — $${v.getDataValue('salary')}`,
        )
        .join('\n');
      return ctx.reply(`Vacancylar:\n\n${text}`);
    });

    this.bot.command('myapplications', async (ctx) => {
      const telegramId = String(ctx.from.id);
      const user = await this.userModel.findOne({
        where: { telegram_id: telegramId },
      });
      if (!user) return ctx.reply("Siz ro'yxatdan o'tmagansiz");

      const applications = await this.applicationModel.findAll({
        where: { user_id: user.id },
        include: [Vacancy],
      });

      if (!applications.length) return ctx.reply("Arizalar yo'q");

      const text = applications
        .map(
          (a, i) =>
            `${i + 1}. ${a.getDataValue('vacancy_id')} — ${a.getDataValue('status')}`,
        )
        .join('\n');
      return ctx.reply(`Mening arizalarim:\n\n${text}`);
    });

    this.bot.command('help', async (ctx) => {
      return ctx.reply(
        'Buyruqlar:\n\n' +
          '/start — boshlash\n' +
          '/jobs — vacancylar\n' +
          '/myapplications — mening arizalarim\n' +
          '/help — yordam',
      );
    });

    this.bot.launch().catch((err) => console.error('Bot error:', err));
    console.log('Telegram bot started ✅');
  }

  async sendNewVacancyNotification(vacancy: any) {
    const users = await this.userModel.findAll({
      where: { role: 'candidate' },
    });
    for (const user of users) {
      const telegramId = user.getDataValue('telegram_id');
      if (telegramId) {
        await this.bot.telegram.sendMessage(
          telegramId,
          `🆕 Yangi vacancy: ${vacancy.title}\n📍 ${vacancy.location}\n💰 $${vacancy.salary}`,
        );
      }
    }
  }

  async sendStatusNotification(
    telegramId: string,
    status: string,
    vacancyTitle: string,
  ) {
    if (!telegramId) return;
    const emoji =
      status === 'accepted' ? '✅' : status === 'rejected' ? '❌' : '⏳';
    await this.bot.telegram.sendMessage(
      telegramId,
      `${emoji} Arizangiz holati o\'zgardi!\nVacancy: ${vacancyTitle}\nStatus: ${status}`,
    );
  }
}
