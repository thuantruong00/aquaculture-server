export const RoleAccess: IRoleAccess = {
  block: {
    root: [],
    admin: [],
    user: ["deviceSetting", "notificationSetting", "customUi"],
    guest: [
      "deviceSetting",
      "notificationGroup",
      "account",
      "customUi",
      "firmwareVersion",
    ],
  },
};

export interface IRoleAccess {
  block: {
    [role: string]: string[]; // role: "root" | "admin" | ... nếu muốn cụ thể hơn
  };
}
