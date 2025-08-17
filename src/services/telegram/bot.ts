// bot.ts
import { Markup, Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { env } from "~/utils";
import { TelegramService } from "./telegram.service";
import { TelegramAccountRepository } from "~/repositories/telegram-account.repo";

export const bot = new Telegraf(env.BOT_TOKEN);
bot.telegram.setMyCommands([{ command: "start", description: "Bắt đầu" }], {
  scope: { type: "all_private_chats" },
});
// Khởi tạo service dựa trên bot.telegram
export const telegramService = new TelegramService(bot.telegram);

// == keyboard
export const mainInlineKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.callback("📝 Đăng ký", "menu:register")],
    [Markup.button.callback("Huỷ đăng ký", "menu:cancel")],
  ]);

bot.start(async (ctx) => {
  // có thể đọc payload deep-link: t.me/your_bot?start=abc  -> ctx.startPayload === "abc"
  await ctx.reply(
    `Xin chào ${ctx.from.username ?? ctx.from.first_name} \nTôi là ${ctx.botInfo.username}`
  );
  // Gửi Reply Keyboard (hiện cố định dưới ô chat)
  await ctx.reply("Menu chính:", mainInlineKeyboard());
});

// (Ví dụ) middleware set role (nếu cần)
// bot.use((ctx, next) => {
//   ctx.state.role = ctx.state.role ?? "there"; // tránh undefined trong ví dụ của bạn
//   return next();
// });

// bot.command("quit", async (ctx) => {
//   await ctx.telegram.leaveChat(ctx.message.chat.id);
//   await ctx.leaveChat();
// });

bot.command("menu", async (ctx) => {
  await ctx.reply("Menu nhanh:", mainInlineKeyboard());
});

bot.on(message("text"), async (ctx) => {
  // Giữ nguyên “reply” ở handler
  await ctx.telegram.sendMessage(
    ctx.message.chat.id,
    `Hello ${ctx.state.role}`
  );
  await ctx.reply(`Hello ${ctx.state.role}`);
});
bot.action("menu:register", async (ctx) => {
  const userId = ctx.from.id;
  const username = ctx.from.username ?? ctx.from.first_name;
  console.log("Người đăng ký:", userId);
  console.log(ctx.from);
  const create = await TelegramAccountRepository.createAccount(String(userId), username, {
    default: "mac dinh",
  });
  await ctx.answerCbQuery("Đã đăng ký thành công!");
  await ctx.reply(`Cảm ơn bạn đã đăng ký! (${username})`);
});
// bot.on("callback_query", async (ctx) => {
//   const data = ctx.callbackQuery.chat_instance;
//   console.log(ctx.callbackQuery);
//   if (data === "menu:register") {
//     const userId = ctx.from.id; // lấy user id
//     console.log("Người đăng ký:", userId);

//     await ctx.answerCbQuery("Đã nhận thông tin đăng ký!");
//     await ctx.reply(`Cảm ơn bạn đã đăng ký! (ID: ${userId})`);
//     return;
//   }

//   // Xử lý các callback khác
//   if (data === "menu:products") {
//     await ctx.answerCbQuery("Bạn chọn Sản phẩm");
//   } else if (data === "menu:support") {
//     await ctx.answerCbQuery("Bạn chọn Hỗ trợ");
//   }
// });

bot.launch();

// Graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
