import { query, Router } from "express";

import {
  AccountController,
  ActivateDeviceSchema,
  ApiDeviceControlBodySchema,
  ApiDeviceControlParamsSchema,
  AuthController,
  CreateDeviceGroupSchema,
  CustomUiController,
  DeviceConnectSchema,
  DeviceControlController,
  DeviceControlQuerySchema,
  DeviceSettingController,
  GetListDeviceGroupQuerySchema,
  GetListRecordSchema,
  HistoryController,
  NotificationSettingController,
  UpdateDeviceGroupInfoSchema,
  UpdateDeviceGroupSchema,
  UpdateDeviceOrdersSchema,
  UpdateDeviceSchema,
  UpdateDeviceStatusSchema,
} from "~/controllers";
import { ActionCreateAccountBodySchema } from "~/controllers/dashboard/account/account.dto";
import { ActionSignInBodySchema } from "~/controllers/dashboard/auth/auth.dto";
import { AutomaticController } from "~/controllers/dashboard/automatic";
import {
  ActionUpdateBodySchema,
  AutomaticSceneSaveBodySchema,
  AutomaticSceneUpdateBodySchema,
  TimerCreateBodySchema,
} from "~/controllers/dashboard/automatic/automatic.dto";
import {
  AddTelegramAccountGroupSchema,
  RemoveTelegramAccountGroupSchema,
  UpdateGroupSchema,
} from "~/controllers/dashboard/notificationSetting/notificationSetting.dto";
import { Middleware, zodMultiValidator } from "~/middlewares";
import { AllRoles, IsUserGroup } from "~/utils/const";
import { UserRole } from "~/utils/enum";

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
const automaticController = new AutomaticController();
dashboardRouter.get(
  "/device-control",
  middleware.webPageMiddleware("deviceControl", { allowedRole: AllRoles }),
  zodMultiValidator({ query: DeviceControlQuerySchema }),
  deviceController.handleDeviceControlPage
);
dashboardRouter.get(
  "/device-control/management",
  middleware.webPageMiddleware("deviceControlManagement", {
    allowedRole: AllRoles,
  }),
  deviceController.handleDeviceControlManagementPage
);

// ─── Automatic ────────────────────────────────────────────────
dashboardRouter.get(
  "/automatic/",
  middleware.webPageMiddleware("automatic", { allowedRole: AllRoles }),
  automaticController.handleAutomaticPage
);
dashboardRouter.get(
  "/automatic/scene-create",
  middleware.webPageMiddleware("automaticSceneCreate", {
    allowedRole: AllRoles,
  }),
  automaticController.handleAutomaticSceneCreatePage
);
dashboardRouter.get(
  "/automatic/scene-detail/:sceneId",
  middleware.webPageMiddleware("automatic", { allowedRole: AllRoles }),
  automaticController.handleAutomaticSceneDetailPage
);
dashboardRouter.get(
  "/automatic/action-detail/:actionId",
  middleware.webPageMiddleware("automaticAction", { allowedRole: AllRoles }),
  automaticController.handleAutomaticActionDetailPage
);

dashboardRouter.post(
  "/automatic/action-detail/:actionId",
  middleware.webPageMiddleware("automaticAction"),
  zodMultiValidator({ body: ActionUpdateBodySchema }),
  automaticController.handleAutomaticActionUpdatePage
);
dashboardRouter.get(
  "/automatic/action-delete/:actionId",
  middleware.webPageMiddleware("automaticAction"),
  automaticController.handleAutomaticActionDeletePage
);

dashboardRouter.post(
  "/automatic/scene-save",
  zodMultiValidator({ body: AutomaticSceneSaveBodySchema }),
  middleware.webPageMiddleware("automaticSceneCreate"),
  automaticController.handleAutomaticSceneSavePage
);
dashboardRouter.post(
  "/automatic/scene-detail/:sceneId",
  zodMultiValidator({ body: AutomaticSceneUpdateBodySchema }),
  middleware.webPageMiddleware("automaticSceneCreate"),
  automaticController.handleAutomaticSceneUpdatePage
);

dashboardRouter.get(
  "/automatic/scene-delete/:sceneId",
  middleware.webPageMiddleware("automaticSceneCreate"),
  automaticController.handleAutomaticSceneDeletePage
);

dashboardRouter.get(
  "/automatic/timer",
  middleware.webPageMiddleware("automaticTimer", { allowedRole: AllRoles }),
  automaticController.handleAutomaticTimerPage
);
dashboardRouter.post(
  "/automatic/timer-create",
  zodMultiValidator({ body: TimerCreateBodySchema }),
  middleware.webPageMiddleware("automaticTimer"),
  automaticController.handleAutomaticTimerCreatePage
);

dashboardRouter.get(
  "/automatic/timer-control/start/:timerJobId",
  middleware.webPageMiddleware("automaticTimer", { allowedRole: AllRoles }),
  automaticController.handleAutomaticTimerStart
);
dashboardRouter.get(
  "/automatic/timer-control/stop/:timerJobId",
  middleware.webPageMiddleware("automaticTimer"),
  automaticController.handleAutomaticTimerStop
);

dashboardRouter.get(
  "/automatic/actions",
  middleware.webPageMiddleware("automaticAction", { allowedRole: AllRoles }),
  automaticController.handleAutomaticActionPage
);

dashboardRouter.get(
  "/automatic/timer-delete/:timerId",
  middleware.webPageMiddleware("automaticSceneCreate"),
  automaticController.handleAutomaticTimerDeletePage
);

// ─── Custom UI ────────────────────────────────────────────────

dashboardRouter.get(
  "/custom-ui",
  zodMultiValidator({ query: GetListDeviceGroupQuerySchema }),
  middleware.webPageMiddleware("customUi"),
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
  zodMultiValidator({ body: UpdateDeviceGroupInfoSchema }),
  middleware.webPageMiddleware("customUi"),
  customUiController.handleUpdateGroupInfoPage
);
dashboardRouter.post(
  "/custom-ui/create-group",
  zodMultiValidator({ body: CreateDeviceGroupSchema }),
  middleware.APImiddleware("deviceGroup"),
  customUiController.handleCreateGroupPage
);

dashboardRouter.post(
  "/custom-ui/add-device",
  zodMultiValidator({ body: UpdateDeviceGroupSchema }),
  middleware.APImiddleware("deviceSettingActivate"),
  customUiController.handleUpdateGroupPage
);
dashboardRouter.post(
  "/custom-ui/remove-device",
  zodMultiValidator({ body: UpdateDeviceGroupSchema }),
  middleware.APImiddleware("deviceSettingActivate"),
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
dashboardRouter.get(
  "/device-setting/detail/:deviceId",
  middleware.webPageMiddleware("deviceSetting"),
  deviceSettingController.handleDetailDevicePage
);
dashboardRouter.post(
  "/device-setting/update/:deviceId",
  zodMultiValidator({ body: UpdateDeviceSchema }),
  middleware.webPageMiddleware("deviceSetting"),
  deviceSettingController.handleUpdateDevicePage
);
dashboardRouter.get(
  "/device-setting/delete/:deviceId",
  middleware.webPageMiddleware("deviceSetting"),
  deviceSettingController.handleDeleteDevicePage
);
// ─── Notification Setting ──────────────────────────────────────────
dashboardRouter.get(
  "/notification-setting",
  middleware.webPageMiddleware("notificationSetting"),
  notificationSettingController.handleNotificationSettingPage
);
dashboardRouter.get(
  "/notification-setting/inactive-telegram",
  middleware.webPageMiddleware("notificationSettingActivateTelegram"),
  notificationSettingController.handleActivateTelegramAccountPage
);
dashboardRouter.get(
  "/notification-setting/activate-telegram/:id",
  middleware.webPageMiddleware("notificationSettingActivateTelegram"),
  notificationSettingController.handleActivateTelegramAccountSubmitPage
);
dashboardRouter.get(
  "/notification-setting/delete-telegram/:id",
  middleware.webPageMiddleware("notificationSettingActivateTelegram"),
  notificationSettingController.handleDeleteTelegramAccountSubmitPage
);
dashboardRouter.get(
  "/notification-setting/detail-telegram/:id",
  middleware.webPageMiddleware("notificationSettingActivateTelegram"),
  notificationSettingController.handleActivateTelegramAccountSubmitPage
);
dashboardRouter.get(
  "/notification-setting/group",
  middleware.webPageMiddleware("notificationGroup"),
  notificationSettingController.handleNotificationSettingGroupPage
);
dashboardRouter.get(
  "/notification-setting/group-detail/:id",
  middleware.webPageMiddleware("notificationGroup"),
  notificationSettingController.handleNotificationGroupDetailPage
);

dashboardRouter.post(
  "/notification-setting/add-telegram-account-group",
  zodMultiValidator({ body: AddTelegramAccountGroupSchema }),
  middleware.webPageMiddleware("notificationGroup"),
  notificationSettingController.handleAddTelegramAccountPage
);
dashboardRouter.get(
  "/notification-setting/delete-group/:groupId",
  middleware.webPageMiddleware("notificationGroup"),
  notificationSettingController.handleDeleteGroup
);
dashboardRouter.get(
  "/notification-setting/new-group/",
  middleware.webPageMiddleware("notificationGroup"),
  notificationSettingController.handleNewGroup
);
dashboardRouter.get(
  "/notification-setting/remove-account-group/",
  middleware.webPageMiddleware("notificationGroup"),
  notificationSettingController.handleRemoveTelegramAccountPage
);
dashboardRouter.post(
  "/notification-setting/update-group/:groupId",
  zodMultiValidator({ body: UpdateGroupSchema }),
  middleware.webPageMiddleware("notificationGroup"),
  notificationSettingController.handleUpdateGroup
);

// ─── History ───────────────────────────────────────────────────────
dashboardRouter.get(
  "/history",
  zodMultiValidator({ query: GetListRecordSchema }),
  middleware.webPageMiddleware("history", { allowedRole: AllRoles }),
  historyController.handleHistoryPage
);

dashboardRouter.get(
  "/chart",
  middleware.webPageMiddleware("chart", { allowedRole: AllRoles }),
  historyController.handleHistoryChartPage
);

// ─── Account ───────────────────────────────────────────────────────
dashboardRouter.get(
  "/account",
  middleware.webPageMiddleware("account"),
  accountController.handleAccountPage
);
dashboardRouter.get(
  "/account/create",
  middleware.webPageMiddleware("accountAdd"),
  accountController.handleAccountCreatePage
);
dashboardRouter.post(
  "/account/create",
  zodMultiValidator({ body: ActionCreateAccountBodySchema }),
  middleware.webPageMiddleware("accountAdd"),
  accountController.handleAccountCreateFormPage
);

dashboardRouter.get(
  "/account/delete/:userId",
  middleware.webPageMiddleware("accountAdd"),
  accountController.handleAccountDeleteFormPage
);

// ─── Auth ───────────────────────────────────────────────────────
dashboardRouter.get("/auth/sign-in", authController.handleSignInPage);
dashboardRouter.post(
  "/auth/sign-in",
  zodMultiValidator({ body: ActionSignInBodySchema }),
  authController.handleSignInFormPage
);
dashboardRouter.get("/auth/sign-out", authController.handleSignOutPage);
// dashboardRouter.post("/auth/login", accountController.handleAccountAddPage);

//###############################################
// ___API___
//###############################################
// chua test dto
dashboardRouter.post(
  "/device-setting/connect",
  zodMultiValidator({ body: DeviceConnectSchema }),
  middleware.APImiddleware("deviceSettingAdd"),
  deviceSettingController.handleApiDeviceConnect
);
dashboardRouter.post(
  "/device-setting/create-otp",
  middleware.webPageMiddleware("deviceSettingAdd", {
    allowedRole: IsUserGroup,
  }),
  deviceSettingController.handleCreatePairingOtpPage
);

// chua test dto
dashboardRouter.post(
  "/device-setting/activate",
  zodMultiValidator({ body: ActivateDeviceSchema }),
  middleware.APImiddleware("deviceSettingActivate"),
  deviceSettingController.handleApiActivateDevice
);

dashboardRouter.post(
  "/device-setting/update-status",
  zodMultiValidator({ body: UpdateDeviceStatusSchema }),
  middleware.APImiddleware("deviceSettingActivate"),
  deviceSettingController.handleApiUpdateDeviceStatus
);

dashboardRouter.post(
  "/device-setting/update-device-orders",
  zodMultiValidator({ body: UpdateDeviceOrdersSchema }),
  middleware.APImiddleware("deviceSettingActivate"),
  deviceSettingController.handleApiUpdateDeviceOrders
);
dashboardRouter.post(
  "/api/device-setting/update-group",
  zodMultiValidator({ body: UpdateDeviceGroupSchema }),
  middleware.APImiddleware("deviceSettingActivate"),
  deviceSettingController.handleApiUpdateGroup
);

// cheat
dashboardRouter.post(
  "/device-setting/create-device-model",
  middleware.APImiddleware("deviceSettingActivate"),
  deviceSettingController.handleApiCreateDeviceModel
);

// dashboardRouter.post(
//   "/custom-ui/create-group",
//   zodMultiValidator({ query: CreateDeviceGroupSchema }),
//   middleware.APImiddleware("deviceGroup"),
//   customUiController.handleApiCreateGroup
// );

// dashboardRouter.get(
//   "/api/custom-ui/device-groups",
//   middleware.APImiddleware("deviceGroup", {
//     query: GetListDeviceGroupQueryDTO,
//   }),
//   customUiController.handleApiGetListDeviceGroups
// );

// ======================== ======================== ========================
// ++                                                                      ++
// ======================== ======================== ========================
dashboardRouter.post(
  "/api/device-control/:deviceId",
  middleware.webPageMiddleware("deviceControl"),
  zodMultiValidator({
    body: ApiDeviceControlBodySchema,
    params: ApiDeviceControlParamsSchema,
  }),
  deviceController.handleApiControlDevice
);
