import { Router } from "express";

import {
  AccountController,
  ActivateDeviceDTO,
  AuthController,
  CreateDeviceGroupDTO,
  CustomUiController,
  DeviceConnectDTO,
  DeviceControlController,
  DeviceSettingController,
  GetListDeviceGroupQueryDTO,
  HistoryController,
  NotificationSettingController,
  UpdateDeviceDTO,
  UpdateDeviceGroupDTO,
  UpdateDeviceGroupInfoDTO,
  UpdateDeviceOrdersDTO,
  UpdateDeviceStatusDTO,
} from "~/controllers";
import { Middleware } from "~/middlewares";

export const dashboardRouter = Router();

// ─── Device Control ────────────────────────────────────────────────
const middleware = new Middleware();
const deviceController = new DeviceControlController();
const authController = new AuthController();
const accountController = new AccountController();
const deviceSettingController = new DeviceSettingController();
const historyController = new HistoryController();
const notificationSettingController = new NotificationSettingController();
const customUiController = new CustomUiController();
dashboardRouter.get(
  "/device-control",
  middleware.webPageMiddleware("deviceControl"),
  deviceController.handleDeviceControlPage
);

dashboardRouter.get(
  "/device-control/timer",
  middleware.webPageMiddleware("deviceControlTimer"),
  deviceController.handleDeviceTimer
);

// ─── Custom UI ────────────────────────────────────────────────

dashboardRouter.get(
  "/custom-ui",
  middleware.webPageMiddleware("customUi", {
    query: GetListDeviceGroupQueryDTO,
  }),
  customUiController.handleCustomUiPage
);
dashboardRouter.get(
  "/custom-ui/device-group",
  middleware.webPageMiddleware("deviceGroup"),
  customUiController.handleDeviceGroupPage
);
dashboardRouter.get(
  "/custom-ui/detail/:groupId",
  middleware.webPageMiddleware("customUi"),
  customUiController.handleDetailDeviceGroupPage
);
dashboardRouter.get(
  "/custom-ui/delete/:groupId",
  middleware.webPageMiddleware("customUi"),
  customUiController.handleDeleteDeviceGroupPage
);
dashboardRouter.post(
  "/custom-ui/update/:groupId",
  middleware.webPageMiddleware("customUi", { body: UpdateDeviceGroupInfoDTO }),
  customUiController.handleUpdateGroupInfoPage
);
dashboardRouter.post(
  "/custom-ui/create-group",
  middleware.APImiddleware("deviceGroup", { body: CreateDeviceGroupDTO }),
  customUiController.handleCreateGroupPage
);

dashboardRouter.post(
  "/custom-ui/add-device",
  middleware.APImiddleware("deviceSettingActivate", {
    body: UpdateDeviceGroupDTO,
  }),
  customUiController.handleUpdateGroupPage
);
dashboardRouter.post(
  "/custom-ui/remove-device",
  middleware.APImiddleware("deviceSettingActivate", {
    body: UpdateDeviceGroupDTO,
  }),
  customUiController.handleRemoveDevicePage
);

// ─── Device Setting ────────────────────────────────────────────────
dashboardRouter.get(
  "/device-setting",
  middleware.webPageMiddleware("deviceSetting"),
  deviceSettingController.handleDeviceSettingPage
);
dashboardRouter.get(
  "/device-setting/add",
  middleware.webPageMiddleware("deviceSettingAdd"),
  deviceSettingController.handleAddDeviceSettingPage
);

// ─── Notification Setting ──────────────────────────────────────────
dashboardRouter.get(
  "/notification-setting",
  middleware.webPageMiddleware("notificationSetting"),
  notificationSettingController.handleNotificationSettingPage
);

// ─── History ───────────────────────────────────────────────────────
dashboardRouter.get(
  "/history",
  middleware.webPageMiddleware("history"),
  historyController.handleHistoryPage
);

// ─── Account ───────────────────────────────────────────────────────
dashboardRouter.get(
  "/account",
  middleware.webPageMiddleware("account"),
  accountController.handleAccountAddPage
);
dashboardRouter.get(
  "/account/add",
  middleware.webPageMiddleware("accountAdd"),
  accountController.handleAccountAddPage
);

// ─── Auth ───────────────────────────────────────────────────────
dashboardRouter.get("/auth/sign-in", authController.handleSignInPage);
dashboardRouter.get("/auth/sign-out", authController.handleSignOutPage);
// dashboardRouter.post("/auth/login", accountController.handleAccountAddPage);

//###############################################
// ___API___
//###############################################
dashboardRouter.post(
  "/device-setting/connect",
  middleware.APImiddleware("deviceSettingAdd", {
    body: DeviceConnectDTO,
  }),
  deviceSettingController.handleApiDeviceConnect
);
dashboardRouter.post(
  "/device-setting/activate",
  middleware.APImiddleware("deviceSettingActivate", {
    body: ActivateDeviceDTO,
  }),
  deviceSettingController.handleApiActivateDevice
);

dashboardRouter.post(
  "/device-setting/update-status",
  middleware.APImiddleware("deviceSettingActivate", {
    body: UpdateDeviceStatusDTO,
  }),
  deviceSettingController.handleApiUpdateDeviceStatus
);

dashboardRouter.post(
  "/device-setting/update/:deviceId",
  middleware.APImiddleware("deviceSettingActivate", {
    body: UpdateDeviceDTO,
    // params: UpdateDeviceParamsDTO,
  }),
  deviceSettingController.handleApiUpdateDevice
);
dashboardRouter.post(
  "/device-setting/update-device-orders",
  middleware.APImiddleware("deviceSettingActivate", {
    body: UpdateDeviceOrdersDTO,
  }),
  deviceSettingController.handleApiUpdateDeviceOrders
);
dashboardRouter.post(
  "/device-setting/update-group",
  middleware.APImiddleware("deviceSettingActivate", {
    body: UpdateDeviceGroupDTO,
  }),
  deviceSettingController.handleApiUpdateGroup
);

// cheat
dashboardRouter.post(
  "/device-setting/create-device-model",
  middleware.APImiddleware("deviceSettingActivate", {}),
  deviceSettingController.handleApiCreateDeviceModel
);

dashboardRouter.post(
  "/custom-ui/create-group",
  middleware.APImiddleware("deviceGroup", { body: CreateDeviceGroupDTO }),
  customUiController.handleApiCreateGroup
);
dashboardRouter.get(
  "/api/custom-ui/device-groups",
  middleware.APImiddleware("deviceGroup", {
    query: GetListDeviceGroupQueryDTO,
  }),
  customUiController.handleApiGetListDeviceGroups
);
