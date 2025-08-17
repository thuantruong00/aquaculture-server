// services/telegram.service.ts
import type { Telegram } from "telegraf";

type SendMessageExtra = Parameters<Telegram["sendMessage"]>[2];
type EditMessageExtra = Parameters<Telegram["editMessageText"]>[3];

export class TelegramService {
  constructor(private readonly tg: Telegram) {}

  /** Gửi tin nhắn thường */
  async notify(
    chatId: number | string,
    text: string,
    extra?: SendMessageExtra
  ) {
    return this.tg.sendMessage(chatId, text, extra);
  }
  async sendManyUserSequential(
    chatIds: string[],
    text: string,
    extra?: SendMessageExtra,
    opts?: { delayMs?: number } // ví dụ delayMs: 50
  ) {
    const results: Array<
      | { chatId: string; ok: true; result: any }
      | { chatId: string; ok: false; error: any }
    > = [];

    for (const id of chatIds) {
      try {
        const res = await this.tg.sendMessage(id, text, extra);
        results.push({ chatId: id, ok: true, result: res });
      } catch (err) {
        results.push({ chatId: id, ok: false, error: err });
      }
      if (opts?.delayMs) await new Promise((r) => setTimeout(r, opts.delayMs));
    }

    return results;
  }

  /** Gửi HTML nhanh */
  async notifyHTML(
    chatId: number | string,
    html: string,
    extra?: SendMessageExtra
  ) {
    return this.tg.sendMessage(chatId, html, { parse_mode: "HTML", ...extra });
  }

  /** Gửi MarkdownV2 nhanh */
  async notifyMD(
    chatId: number | string,
    md: string,
    extra?: SendMessageExtra
  ) {
    return this.tg.sendMessage(chatId, md, {
      parse_mode: "MarkdownV2",
      ...extra,
    });
  }

  /** Trả lời callback query (nếu cần dùng ngoài handler) */
  async answerCbQuery(
    cbQueryId: string,
    text?: string,
    showAlert = false,
    url?: string
  ) {
    return this.tg.answerCbQuery(cbQueryId, text, {
      show_alert: showAlert,
      url,
    });
  }

  /** Chỉnh sửa nội dung message đã gửi (inline keyboards, vv.) */
  // async editMessageText(
  //   chatId: number | string,
  //   messageId: number,
  //   text: string,
  //   extra?: EditMessageExtra
  // ) {
  //   return this.tg.editMessageText(chatId, messageId, undefined, text, extra);
  // }

  /** Gửi ảnh nhanh (tuỳ chọn) */
  async photo(
    chatId: number | string,
    photo: string | Buffer,
    caption?: string
  ) {
    return this.tg.sendPhoto(
      chatId,
      photo as any,
      caption ? { caption } : undefined
    );
  }

  /** Broadcast đơn giản (tuỳ chọn) */
  async broadcast(
    chatIds: Array<number | string>,
    text: string,
    extra?: SendMessageExtra
  ) {
    return Promise.allSettled(
      chatIds.map((id) => this.notify(id, text, extra))
    );
  }
}
