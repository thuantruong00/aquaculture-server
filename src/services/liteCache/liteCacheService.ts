import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { AppSchema } from "./liteCache.interface";
const adapter = new JSONFile<AppSchema>("data/db.json");

export class LiteCacheService {
  private db: Low<AppSchema>;
  constructor() {
    this.db = new Low<AppSchema>(adapter, { cache: {} });
  }
  // Khởi tạo database với nhánh cache rỗng
  //   static async initLiteCache() {
  //     await this.db.read();

  //     // Nếu file trống hoặc null → gán schema mặc định
  //     if (!this.db.data) {
  //       this.db.data = { cache: {} };
  //     } else {
  //       // Nếu thiếu nhánh cache thì bổ sung
  //       if (!this.db.data.cache) {
  //         this.db.data.cache = {};
  //       }
  //     }

  //     await this.db.write();
  //   }

  // Ghi giá trị vào cache
  async set(key: string, value: any) {
    this.db.data.cache[key] = value;
    return await this.db.write();
  }

  // Đọc giá trị từ cache
  async get(key: string) {
    await this.db.read();
    return this.db.data?.cache?.[key];
  }

  // Kiểm tra có key hay không
  has(key: string): boolean {
    return key in this.db.data!.cache;
  }
  getDb() {
    return this.db;
  }
}
