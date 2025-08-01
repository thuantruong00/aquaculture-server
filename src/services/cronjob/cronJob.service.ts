import cron, { ScheduledTask } from "node-cron";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { DataSchema, JobEntry } from "./cronJob.interface";
import { TimerType } from "~/utils/enum";

const adapter = new JSONFile<DataSchema>("data/db.json");
const defaultData: DataSchema = { jobs: [] };
const db = new Low<DataSchema>(adapter, defaultData);

const jobMap: Map<string, ScheduledTask> = new Map();

export async function initJobs(): Promise<void> {
  await db.read().catch(() => {
    db.data = { jobs: [] };
  });

  for (const job of db.data.jobs) {
    startJob(job);
  }
}

export async function addJob(job: JobEntry): Promise<void> {
  if (jobMap.has(job.id)) {
    throw new Error("Job ID đã tồn tại");
  }

  db.data.jobs.push(job);
  await db.write();
  startJob(job);
}

export async function removeJob(id: string): Promise<void> {
  const task = jobMap.get(id);
  if (task) {
    task.stop();
    jobMap.delete(id);
  }

  db.data.jobs = db.data.jobs.filter((j) => j.id !== id);
  await db.write();
}

export function listJobs(): JobEntry[] {
  return db.data.jobs;
}

// --------------------- CORE EXECUTOR ---------------------

function startJob(job: JobEntry): void {
  const task = cron.schedule(job.schedule, async () => {
    console.log(`🕒 Job [${job.id}] running →`, job);

    try {
      await executeJobAction(job);
    } catch (err) {
      console.error(`❌ Job [${job.id}] failed:`, err);
    }

    // Nếu chỉ chạy một lần thì dọn dẹp
    if (job.mode === TimerType.ONCE) {
      task.stop();
      jobMap.delete(job.id);
      await removeJob(job.id);
    }
  });

  jobMap.set(job.id, task);
}

// Example runner: customize theo hệ thống
async function executeJobAction(cmd: JobEntry) {
  console.log(`⚙ Thực thi lệnh →`, cmd);
  // TODO: Gửi MQTT hoặc trigger thiết bị thật
}

/**
 * Chuyển timestamp (milliseconds) sang biểu thức cron (một lần chạy).
 * @param timestamp Epoch time (milliseconds)
 * @returns Cron expression theo format: "m h D M *"
 */
export function timestampToCron(timestamp: number): string {
  const date = new Date(timestamp);

  const minute = date.getMinutes();
  const hour = date.getHours();
  const day = date.getDate();
  const month = date.getMonth() + 1; // cron: 1-12
  // Không cần day-of-week → dùng * để không giới hạn

  return `${minute} ${hour} ${day} ${month} *`;
}

/**
 * Chuyển định dạng giờ (HH:mm) sang biểu thức cron "m h * * *"
 * @param timeStr Định dạng "HH:mm"
 * @returns Biểu thức cron tương ứng
 */
export function timeStringToCron(timeStr: string): string {
  const [hourStr, minuteStr] = timeStr.split(":");

  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  if (
    isNaN(hour) ||
    isNaN(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    throw new Error(
      `⛔ Invalid time string format: "${timeStr}". Expected HH:mm (24h)`
    );
  }

  return `${minute} ${hour} * * *`;
}

export function secondsToCron(seconds: number): string {
  if (!Number.isInteger(seconds) || seconds <= 0) {
    throw new Error(`⛔ Invalid seconds: ${seconds}`);
  }

  // Dưới 60s: cron từng giây (chỉ node-cron mới hỗ trợ)
  if (seconds < 60) {
    return `*/${seconds} * * * * *`; // e.g. 30s → "*/30 * * * * *"
  }

  // Là bội số chính xác của 60 (tính bằng phút)
  if (seconds % 60 === 0) {
    const minutes = seconds / 60;

    if (minutes < 60) {
      return `*/${minutes} * * * *`; // e.g. 120s → "*/2 * * * *"
    }

    if (minutes % 60 === 0) {
      const hours = minutes / 60;

      if (hours < 24) {
        return `0 */${hours} * * *`; // e.g. 3600s → "0 */1 * * *"
      }

      if (hours % 24 === 0) {
        const days = hours / 24;
        return `0 0 */${days} * *`; // e.g. 86400s → "0 0 */1 * *"
      }
    }
  }

  throw new Error(
    `⛔ Cannot convert ${seconds}s to a valid cron expression. Use setTimeout instead for precise one-time delay.`
  );
}
