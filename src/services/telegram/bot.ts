// bot.ts
import { Markup, Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { env } from "~/utils";
import { TelegramService } from "./telegram.service";
import { TelegramAccountRepository } from "~/repositories/telegram-account.repo";
import { logger } from "~/utils/logger";

export const bot = new Telegraf(env.BOT_TOKEN, {
  telegram: {
    apiRoot: "https://tele-proxy.bluesky2016s.workers.dev",
  },
});

// 1. Catch tất cả lỗi trong bot (toàn cục)
bot.catch((err, ctx) => {
  logger.error(`❌ Bot error on update type ${ctx.updateType}`, err);
});

// 2. Set command an toàn
(async () => {
  try {
    await bot.telegram.setMyCommands(
      [{ command: "start", description: "Bắt đầu" }],
      { scope: { type: "all_private_chats" } }
    );
    logger.info("✅ Telegram commands set");
  } catch (err) {
    console.error(
      "⚠️ Failed to set Telegram commands:",
      (err as Error).message
    );
  }
})();

// 3. Khởi tạo service dựa trên bot.telegram
export const telegramService = new TelegramService(bot.telegram);

// == keyboard
export const mainInlineKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback("📝 Đăng ký", "menu:register")],
    [Markup.button.callback("Huỷ đăng ký", "menu:cancel")],
  ]);

// Handlers
bot.start(async (ctx) => {
  try {
    await ctx.reply(
      `Xin chào ${ctx.from.username ?? ctx.from.first_name} \nTôi là ${ctx.botInfo.username}`
    );
    await ctx.reply("Menu chính:", mainInlineKeyboard());
  } catch (err) {
    console.error("❌ Error in /start:", err);
  }
});

bot.command("menu", async (ctx) => {
  try {
    await ctx.reply("Menu nhanh:", mainInlineKeyboard());
  } catch (err) {
    console.error("❌ Error in /menu:", err);
  }
});

bot.on(message("text"), async (ctx) => {
  try {
    await ctx.telegram.sendMessage(
      ctx.message.chat.id,
      `Hello ${ctx.state.role ?? "user"}`
    );
    await ctx.reply(`Hello ${ctx.state.role ?? "user"}`);
  } catch (err) {
    console.error("❌ Error in text handler:", err);
  }
});

bot.action("menu:register", async (ctx) => {
  try {
    const userId = ctx.from.id;
    const username = ctx.from.username ?? ctx.from.first_name;
    logger.info(`Người đăng ký: ${userId}, ${ctx.from}`);

    await TelegramAccountRepository.createAccount(String(userId), username, {
      default: "mac dinh",
    });

    await ctx.answerCbQuery("Đã đăng ký thành công!");
    await ctx.reply(`Cảm ơn bạn đã đăng ký! (${username})`);
  } catch (err) {
    logger.error("❌ Error in menu:register:", err);
  }
});

// 4. Launch bot an toàn
(async () => {
  try {
    await bot.launch();
    logger.info(`Telegram bot launched`);
  } catch (err) {
    logger.error("❌ Failed to launch bot:", err);
  }
})();

// 5. Graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
