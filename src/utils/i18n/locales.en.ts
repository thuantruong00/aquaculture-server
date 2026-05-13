// locales/en.ts
export const EN = {
  greeting: "Hello {{name}}!",
  menu: {
    main: "Main menu",
    register: "Register",
    help: "Help",
    settings: "Settings",
  },
  notification: {
    triggered: "Event: {{eventName}} on device {{deviceCode}} at {{time}}",
    executed: "✅ Executed {{command}} on {{deviceCode}} at {{time}}",
    failed: "⛔ Failed job {{jobId}}: {{reason}}",
  },
  errors: {
    not_found: "Not found",
    unauthorized: "You are not authorized",
    invalid_param: "Invalid parameter: {{param}}",
  },
  buttons: {
    confirm: "Confirm",
    cancel: "Cancel",
    share_phone: "Share phone number",
  },
  sensors: {
    temperature: "temperature",
    TemperatureWater: "Temperature Water",
    Temperature: "Temperature",
    Humidity: "Humidity",
    do: "DO",
    Switch: "Switch",
    CO2: "CO2",
  },
  logicOperator: {
    and: "and",
    or: "or",
  },
  comparisonOperators: {
    lt: { symbol: "<", label: "less than" },
    lte: { symbol: "<=", label: "less than or equal" },
    gt: { symbol: ">", label: "greater than" },
    gte: { symbol: ">=", label: "greater than or equal" },
    eq: { symbol: "==", label: "equal" },
    neq: { symbol: "!=", label: "not equal" },
  },
  status: {
    inactive: "inactive",
    active: "active",
    pending: "pending",
    banned: "banned",
    deleted: "deleted",
    paused: "paused",
  },
} as const;

export type LocaleObject = typeof EN;
