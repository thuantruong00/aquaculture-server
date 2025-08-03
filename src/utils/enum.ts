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
export enum ComparisonOperatorSymbol {
  LT = "< bé hơn",
  LTE = "<= bé hơn hoặc bằng",
  GT = "> lớn hơn",
  GTE = ">= lớn hơn hoặc bằng",
  EQ = "== bằng",
  NEQ = "!= khác",
}
export enum LogicOperator {
  AND = "and",
  OR = "or",
}
export enum LogicOperatorLabel {
  AND = "Và",
  OR = "Hoặc",
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
export enum ActionStatus {
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


export enum RepeatUnit {
  DAY = "day",
  HOUR = "hour",
  MINUTE = "minute",
}
export enum RepeatUnitLabel {
  DAY = "Ngày",
  HOUR = "Giờ",
  MINUTES = "Phút",
}

export enum TimerStatus {
  INACTIVE = "inactive",
  ACTIVE = "active",
  PENDING = "pending",
  PAUSED = "paused",
  DELETED = "deleted",
}
export enum TimerPurpose {
  COMMON = "common",
  COMMAND = "command",
  ERROR_HANDLER = "error_handler",
  MONITOR = "monitor", // optional: future use
  SENSOR_CHECK = "sensor_check",
}

export enum MqttDeviceFunction {
  TELEMETRY = "telemetry",
  COMMAND = "command",
  RESPONSE = "response",
  SETTING = "setting",
  PING = "ping",
}

export enum OtpTarget {
  PAIRING = "pairing",
}
