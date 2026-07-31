export interface JobEntry {
  id: string;
  schedule: string;
  isRepeating: boolean;
  refTable?: "action" | "device" | "notification" | "command";
  refId?: string;
  command?: {
    deviceId?: string;
    key: string;
    value?: string | number | boolean;
  };
}

export type JobStore = {
  jobs: JobEntry[];
};
