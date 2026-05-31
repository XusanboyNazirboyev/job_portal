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
    // 1. /start
    this.bot.start(async (ctx) => {
      await ctx.reply(
        `Salom ${ctx.from.first_name}! Job Portal botga xush kelibsiz!\n\n` +
          `Hisobingizni ulash uchun saytda ro'yxatdan o'tgan emailingizni yuboring.\n\n` +
          `/jobs — vacancylar\n` +
          `/myapplications — mening arizalarim\n` +
          `/help — yordam`,
      );
    });

    // 2. /jobs
    this.bot.command('jobs', async (ctx) => {
      const vacancies = await this.vacancyModel.findAll({ limit: 10 });
      if (!vacancies.length) {
        return ctx.reply("Hozircha vacancy yo'q");
      }
      const text = vacancies
        .map(
          (v, i) =>
            `${i + 1}. ${v.getDataValue('title')} — ${v.getDataValue('location') ?? "Noma'lum"} — $${v.getDataValue('salary') ?? '—'}`,
        )
        .join('\n');
      return ctx.reply(`📋 Vacancylar:\n\n${text}`);
    });

    // 3. /myapplications
    this.bot.command('myapplications', async (ctx) => {
      const telegramId = String(ctx.from.id);
      const user = await this.userModel.findOne({
        where: { telegram_id: telegramId },
      });
      if (!user) {
        return ctx.reply('Hisobingiz ulanmagan. Emailingizni yuboring.');
      }

      const applications = await this.applicationModel.findAll({
        where: { user_id: user.getDataValue('id') },
        include: [Vacancy],
      });

      if (!applications.length) return ctx.reply("Arizalar yo'q");

      const text = applications
        .map((a, i) => {
          const vacancy = a.get('vacancy') as Vacancy;
          const title = vacancy?.getDataValue('title') ?? "Noma'lum vacancy";
          const status = a.getDataValue('status');
          return `${i + 1}. ${title} — ${status}`;
        })
        .join('\n');
      return ctx.reply(`📄 Mening arizalarim:\n\n${text}`);
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

    this.bot.command('unlink', async (ctx) => {
      const telegramId = String(ctx.from.id);
      await this.userModel.update(
        { telegram_id: null },
        { where: { telegram_id: telegramId } },
      );
      return ctx.reply(
        'Hisobingiz uzildi. Qayta ulash uchun emailingizni yuboring.',
      );
    });


    this.bot.on('text', async (ctx) => {
      const text = ctx.message.text.trim();
      if (text.startsWith('/')) return; // ignore unknown commands

      const telegramId = String(ctx.from.id);

      const alreadyLinked = await this.userModel.findOne({
        where: { telegram_id: telegramId },
      });
      if (alreadyLinked) {
        return ctx.reply(`Hisobingiz allaqachon ulangan ✅`);
      }

      const user = await this.userModel.findOne({ where: { email: text } });
      if (!user) {
        return ctx.reply(
          `Bu email bilan foydalanuvchi topilmadi.\nIltimos, to'g'ri emailingizni kiriting.`,
        );
      }

      await user.update({ telegram_id: telegramId });
      await ctx.reply(
        `Hisobingiz muvaffaqiyatli ulandi! ✅\nXush kelibsiz, ${user.getDataValue('full_name')}!`,
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
        await this.bot.telegram
          .sendMessage(
            telegramId,
            `🆕 Yangi vacancy: ${vacancy.title}\n📍 ${vacancy.location ?? "Noma'lum"}\n💰 $${vacancy.salary ?? '—'}`,
          )
          .catch(() => {});
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
    await this.bot.telegram
      .sendMessage(
        telegramId,
        `${emoji} Arizangiz holati o'zgardi!\nVacancy: ${vacancyTitle}\nStatus: ${status}`,
      )
      .catch(() => {});
  }
}
