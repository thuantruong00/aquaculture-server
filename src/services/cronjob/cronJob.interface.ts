import { TimerType } from "~/utils/enum";

export interface JobEntry {
  id: string;
  schedule: string;
  mode: TimerType;
  refTable?: "action" | "device" | "notification" | "command";
  refId?: string;
  command?: {
    deviceId?: string;
    key: string;
    value?: string | number | boolean;
  };
}

export type DataSchema = {
  jobs: JobEntry[];
};
