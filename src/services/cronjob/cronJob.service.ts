import cron, { ScheduledTask } from "node-cron";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
// import { DataSchema, JobEntry } from "./cronJob.interface";
import { MqttService } from "../mqtt";
import { actionQueue } from "../queues";
import { AppSchema, JobEntry } from "../liteCache";

const adapter = new JSONFile<AppSchema>("data/db.json");
const defaultData: AppSchema = { jobs: [], cache: {} };
const db = new Low<AppSchema>(adapter, defaultData);

const jobMap: Map<string, ScheduledTask> = new Map();
const mqttService = new MqttService();
export async function initJobs(): Promise<void> {
  await db.read().catch(() => {
    db.data = { jobs: [], cache: {} };
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
    // console.log(`🕒 Job [${job.id}] running →`, job);

    try {
      await executeJobAction(job);
    } catch (err) {
      console.error(`❌ Job [${job.id}] failed:`, err);
    }

    // Nếu chỉ chạy một lần thì dọn dẹp
    if (!job.isRepeating) {
      task.stop();
      jobMap.delete(job.id);
      await removeJob(job.id);
    }
  });

  jobMap.set(job.id, task);
}

// Example runner: customize theo hệ thống
async function executeJobAction(cmd: JobEntry) {
  // console.log(`⚙ Thực thi lệnh →`, cmd);
  if (cmd.refId && cmd.refTable == "action") {
    // add to queue
    // mqttService.processByActionId(cmd.refId);
    actionQueue.push({
      topic: cmd.refTable,
      payload: { refId: cmd.refId, command: cmd.command },
    });
  }
  return;
  // TODO: Gửi MQTT hoặc trigger thiết bị thật
}
