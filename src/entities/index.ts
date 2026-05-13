// Centralized schema registration. Importing this file ensures
// all mongoose models are registered before any populate/usage.

export { Device } from "./device.entity";
export { DeviceConnectionLog } from "./device-connection-log.entity";
export { DeviceGroup } from "./device-group.entity";
export { DeviceModel } from "./device-model.entity";
export { DeviceRecord } from "./device-record.entity";
export { DeviceFieldConfig } from "./device-field-config.entity";
export { ExecutionLog } from "./execution-log.entity";
export { TimerJob } from "./timer-job.entity";
export { User } from "./user.entity";
export { Zone } from "./zone.entity";
export { Otp } from "./otp.entity";
export { NotificationOption } from "./notification-option.entity";
export { TelegramAccount } from "./telegram-account.entity";
export { AutomationScene } from "./automatic-scene.entity";
export { Action } from "./automatic-scene-action.entity";
export { ActionRecord } from "./action-record.entity";
