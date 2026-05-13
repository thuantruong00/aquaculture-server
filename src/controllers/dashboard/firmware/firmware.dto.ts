import { z } from "zod";

export const FirmwareGetInfoSchema = z.object({
  deviceId: z.string().min(1, "deviceId is required"),
});

export type IFirmwareGetInfoDTO = z.infer<typeof FirmwareGetInfoSchema>;

export const FirmwareOtaUploadSchema = z.object({
  targetFile: z.string().min(1, "targetFile is required"),
  deviceIds: z.array(z.string().min(1)).min(1, "deviceIds is required"),
});

export type IFirmwareOtaUploadDTO = z.infer<typeof FirmwareOtaUploadSchema>;
