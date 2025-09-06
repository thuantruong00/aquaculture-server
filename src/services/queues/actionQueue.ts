import fastq from "fastq";
import { MqttService } from "../mqtt";
import { logger } from "~/utils/logger";
const mqttService = new MqttService();
// Kiểu dữ liệu của task
export interface ActionTask {
  topic: string;
  payload: {
    refId?: string;
    command?: {
      deviceId?: string;
      key: string;
      value?: string | number | boolean;
    };
  };
}

// Worker function (phải nhận đúng 1 task)
async function worker(task: ActionTask): Promise<void> {
  // await actionService.processTask(task);
  if (task.topic === "action" && task.payload.refId) {
    logger.info(`topic : ${task.topic} - id : ${task.payload.refId}`);
    mqttService.processByActionId(task.payload.refId);
  }

  return;
}

// Tạo queue: fastq.promise(workerFn, concurrency)
export const actionQueue = fastq.promise(worker, 1);
