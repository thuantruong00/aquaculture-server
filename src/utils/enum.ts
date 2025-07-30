export enum DeviceStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  BANNED = "banned",
  DELETED = "deleted",
}
export enum DeviceType {
  SENSOR = "sensor",
  ACTUATOR = "actuator",
}

export enum UserRole {
  ROOT = "root",
  ADMIN = "admin",
  USER = "user",
  GUEST = "guest",
}
export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  BANNED = "banned",
  DELETED = "deleted",
}

export enum DeviceGroup {
  DEFAULT = "default",
}
export enum DeviceGroupStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  BANNED = "banned",
  DELETED = "deleted",
}
export enum DeviceZone {
  DEFAULT = "default",
}
export enum CssClass {
  DEFAULT = "group-default",
}

export enum DeviceFieldType {
  INTEGER = "integer",
  FLOAT = "float",
  BOOLEAN = "boolean",
  STRING = "string",
}

export enum ComparisonOperator {
  LT = "lt",
  LTE = "lte",
  GT = "gt",
  GTE = "gte",
  EQ = "eq",
  NEQ = "neq",
}
export enum LogicOperator {
  AND = "and",
  OR = "or",
}

export enum ExecutionStatus {
  CREATED = 1,
  SENT = 2,
  SYNCED = 3,
  TIMEOUT = 4,
  FAILED = 5,
}

export enum SceneStatus {
  INACTIVE = "inactive",
  ACTIVE = "active",
  PENDING = "pending",
  PAUSED = "paused",
  DELETED = "deleted",
}

export enum ExecutionSource {
  SCENE = "scene",
  MANUAL = "manual",
  SCHEDULE = "schedule", // từ cron server
}

export enum TimerType {
  ONCE = "once",
  RECURRING = "recurring",
}

export enum TimerStatus {
  INACTIVE = "inactive",
  ACTIVE = "active",
  PENDING = "pending",
  PAUSED = "paused",
  DELETED = "deleted",
}
export enum TimerPurpose {
  COMMAND = "command",
  ERROR_HANDLER = "error_handler",
  MONITOR = "monitor", // optional: future use
  SENSOR_CHECK = "sensor_check",
}

export enum DeviceGroupTemplate {
  DEFAULT = "group-basic-1",
  BASIC_2 = "group-basic-2",
}

export enum MqttDeviceFunction {
  TELEMETRY = "telemetry",
  COMMAND = "command",
  RESPONSE = "response",
  SETTING = "setting",
  PING = "ping",
}
