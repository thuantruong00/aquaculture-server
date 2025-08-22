export const VI = {
  greeting: "Xin chào {{name}}!",
  menu: {
    main: "Menu chính",
    register: "Đăng ký",
    help: "Trợ giúp",
    settings: "Cài đặt",
  },
  notification: {
    triggered:
      "Sự kiện: {{eventName}} trên thiết bị {{deviceCode}} lúc {{time}}",
    executed: "✅ Đã thực thi {{command}} trên {{deviceCode}} lúc {{time}}",
    failed: "⛔ Công việc {{jobId}} thất bại: {{reason}}",
  },
  errors: {
    not_found: "Không tìm thấy",
    unauthorized: "Bạn không có quyền",
    invalid_param: "Tham số không hợp lệ: {{param}}",
  },
  buttons: {
    confirm: "Xác nhận",
    cancel: "Hủy",
    share_phone: "Chia sẻ số điện thoại",
  },
  sensors: {
    temperature: "nhiệt độ",
    TemperatureWater: "nhiệt độ nước",
    do: "oxy hòa tan",
    DO: "oxy hòa tan",
  },
  logicOperator: {
    and: "Và",
    or: "Hoặc",
  },
  comparisonOperators: {
    lt: { symbol: "<", label: "bé hơn" },
    lte: { symbol: "<=", label: "bé hơn hoặc bằng" },
    gt: { symbol: ">", label: "lớn hơn" },
    gte: { symbol: ">=", label: "lớn hơn hoặc bằng" },
    eq: { symbol: "==", label: "bằng" },
    neq: { symbol: "!=", label: "khác" },
  },
  status: {
    inactive: "chưa kích hoạt",
    active: "đã kích hoạt",
    pending: "bị khoá",
    banned: "bị khoá",
    deleted: "bị xoá",
    paused: "tạm dừng",
  },
} as const;

export type LocaleVI = typeof VI;
