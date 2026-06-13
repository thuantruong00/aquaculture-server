import { query, Router } from "express";
import { mkdirSync } from "fs";
import multer from "multer";
import path from "path";
import is from "zod/v4/locales/is.cjs";

import {
  AccountController,
  AppSettingController,
  ActivateDeviceSchema,
  ApiDeviceControlBodySchema,
  ApiDeviceControlParamsSchema,
  AuthController,
  CreateDeviceFieldConfigSchema,
  CreateDeviceGroupSchema,
  CustomUiController,
  DeviceConnectSchema,
  DeviceControlController,
  DeviceControlQuerySchema,
  DeviceSettingController,
  FirmwareGetInfoSchema,
  GetDeviceConnectionLogsQuerySchema,
  GetListDeviceGroupQuerySchema,
  GetListRecordSchema,
  HistoryController,
  NotificationSettingController,
  FirmwareController,
  FirmwareOtaUploadSchema,
  UpdateDeviceGroupInfoSchema,
  UpdateDeviceGroupSchema,
  UpdateDeviceOrdersSchema,
  UpdateDeviceSchema,
  UpdateDeviceFieldConfigSchema,
  UpdateDeviceStatusSchema,
  UpdateIpSchema,
  ApiTelemetryBodySchema,
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
import { IntroductionController } from "~/controllers/dashboard/introduction";
import {
  AddTelegramAccountGroupSchema,
  RemoveTelegramAccountGroupSchema,
  UpdateGroupSchema,
} from "~/controllers/dashboard/notificationSetting/notificationSetting.dto";
import { Middleware, zodMultiValidator } from "~/middlewares";
import { AllRoles, IsUserGroup } from "~/utils/const";
import { env } from "~/utils";
import { UserRole } from "~/utils/enum";

export const dashboardRouter = Router();

const firmwareStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const firmwaresDir = path.resolve(env.FIRMWARES_DIR);
    mkdirSync(firmwaresDir, { recursive: true });
    cb(null, firmwaresDir);
  },
  filename: (_req, file, cb) => {
    const filename = path.basename(file.originalname);
    const safePattern = /^[a-zA-Z0-9._-]+\.bin$/;

    if (!safePattern.test(filename)) {
      cb(new Error("Invalid firmware filename"), filename);
      return;
    }

    cb(null, filename);
  },
});

const firmwareUpload = multer({
  storage: firmwareStorage,
  fileFilter: (_req, file, cb) => {
    if (!file.originalname.toLowerCase().endsWith(".bin")) {
      cb(new Error("Only .bin files are allowed"));
      return;
    }

    cb(null, true);
  },
});

// ─── Device Control ────────────────────────────────────────────────
const middleware = new Middleware();
const deviceController = new DeviceControlController();
const authController = new AuthController();
const accountController = new AccountController();
const appSettingController = new AppSettingController();
const deviceSettingController = new DeviceSettingController();
const historyController = new HistoryController();
const notificationSettingController = new NotificationSettingController();
const customUiController = new CustomUiController();
const automaticController = new AutomaticController();
const firmwareController = new FirmwareController();
const introductionController = new IntroductionController();
dashboardRouter.get(
  "/device-control",
  middleware.webPageMiddleware("deviceControl", { allowedRole: IsUserGroup }),
  zodMultiValidator({ query: DeviceControlQuerySchema }),
  deviceController.handleDeviceControlPage.bind(deviceController),
);
dashboardRouter.get(
  "/device-control/management",
  middleware.webPageMiddleware("deviceControlManagement", {
    allowedRole: IsUserGroup,
  }),
  deviceController.handleDeviceControlManagementPage.bind(deviceController),
);

dashboardRouter.get(
  "/device-control/connection",
  middleware.webPageMiddleware("deviceControlConnection", {
    allowedRole: IsUserGroup,
  }),
  deviceController.handleDeviceControlConnectionPage.bind(deviceController),
);

dashboardRouter.post(
  "/device-control/connection/command",
  middleware.webPageMiddleware("deviceControlConnection", {
    allowedRole: IsUserGroup,
  }),
  deviceController.handleDeviceControlConnectionCommandPage.bind(deviceController),
);

// ─── Automatic ────────────────────────────────────────────────
dashboardRouter.get(
  "/automatic/",
  middleware.webPageMiddleware("automatic", { allowedRole: IsUserGroup }),
  automaticController.handleAutomaticPage.bind(automaticController),
);
dashboardRouter.get(
  "/automatic/scene-create",
  middleware.webPageMiddleware("automaticSceneCreate", {
    allowedRole: IsUserGroup,
  }),
  automaticController.handleAutomaticSceneCreatePage.bind(automaticController),
);
dashboardRouter.get(
  "/automatic/scene-detail/:sceneId",
  middleware.webPageMiddleware("automatic", { allowedRole: IsUserGroup }),
  automaticController.handleAutomaticSceneDetailPage.bind(automaticController),
);

dashboardRouter.get(
  "/automatic/action-create",
  middleware.webPageMiddleware("automaticSceneCreate", {}),
  automaticController.handleAutomaticCreateActionPage.bind(automaticController),
);

dashboardRouter.get(
  "/automatic/action-detail/:actionId",
  middleware.webPageMiddleware("automaticAction", { allowedRole: IsUserGroup }),
  automaticController.handleAutomaticActionDetailPage.bind(automaticController),
);

dashboardRouter.post(
  "/automatic/action-detail/:actionId",
  middleware.webPageMiddleware("automaticAction"),
  zodMultiValidator({ body: ActionUpdateBodySchema }),
  automaticController.handleAutomaticActionUpdatePage.bind(automaticController),
);
dashboardRouter.get(
  "/automatic/action-delete/:actionId",
  middleware.webPageMiddleware("automaticAction"),
  automaticController.handleAutomaticActionDeletePage.bind(automaticController),
);

dashboardRouter.post(
  "/automatic/scene-save",
  zodMultiValidator({ body: AutomaticSceneSaveBodySchema }),
  middleware.webPageMiddleware("automaticSceneCreate"),
  automaticController.handleAutomaticSceneSavePage.bind(automaticController),
);
dashboardRouter.post(
  "/automatic/scene-detail/:sceneId",
  zodMultiValidator({ body: AutomaticSceneUpdateBodySchema }),
  middleware.webPageMiddleware("automaticSceneCreate"),
  automaticController.handleAutomaticSceneUpdatePage.bind(automaticController),
);

dashboardRouter.get(
  "/automatic/scene-delete/:sceneId",
  middleware.webPageMiddleware("automaticSceneCreate"),
  automaticController.handleAutomaticSceneDeletePage.bind(automaticController),
);

dashboardRouter.get(
  "/automatic/timer",
  middleware.webPageMiddleware("automaticTimer", { allowedRole: IsUserGroup }),
  automaticController.handleAutomaticTimerPage.bind(automaticController),
);
dashboardRouter.post(
  "/automatic/timer-create",
  zodMultiValidator({ body: TimerCreateBodySchema }),
  middleware.webPageMiddleware("automaticTimer"),
  automaticController.handleAutomaticTimerCreatePage.bind(automaticController),
);

dashboardRouter.get(
  "/automatic/timer-control/start/:timerJobId",
  middleware.webPageMiddleware("automaticTimer", { allowedRole: IsUserGroup }),
  automaticController.handleAutomaticTimerStart.bind(automaticController),
);
dashboardRouter.get(
  "/automatic/timer-control/stop/:timerJobId",
  middleware.webPageMiddleware("automaticTimer"),
  automaticController.handleAutomaticTimerStop.bind(automaticController),
);

dashboardRouter.get(
  "/automatic/actions",
  middleware.webPageMiddleware("automaticAction", { allowedRole: IsUserGroup }),
  automaticController.handleAutomaticActionPage.bind(automaticController),
);

dashboardRouter.get(
  "/automatic/timer-delete/:timerId",
  middleware.webPageMiddleware("automaticSceneCreate"),
  automaticController.handleAutomaticTimerDeletePage.bind(automaticController),
);

// ─── Custom UI ────────────────────────────────────────────────

dashboardRouter.get(
  "/custom-ui",
  zodMultiValidator({ query: GetListDeviceGroupQuerySchema }),
  middleware.webPageMiddleware("customUi"),
  customUiController.handleCustomUiPage.bind(customUiController),
);
dashboardRouter.get(
  "/custom-ui/device-group",
  middleware.webPageMiddleware("deviceGroup"),
  customUiController.handleDeviceGroupPage.bind(customUiController),
);
dashboardRouter.get(
  "/custom-ui/detail/:groupId",
  middleware.webPageMiddleware("customUi"),
  customUiController.handleDetailDeviceGroupPage.bind(customUiController),
);
dashboardRouter.get(
  "/custom-ui/delete/:groupId",
  middleware.webPageMiddleware("customUi"),
  customUiController.handleDeleteDeviceGroupPage.bind(customUiController),
);
dashboardRouter.post(
  "/custom-ui/update/:groupId",
  zodMultiValidator({ body: UpdateDeviceGroupInfoSchema }),
  middleware.webPageMiddleware("customUi"),
  customUiController.handleUpdateGroupInfoPage.bind(customUiController),
);
dashboardRouter.post(
  "/custom-ui/create-group",
  zodMultiValidator({ body: CreateDeviceGroupSchema }),
  middleware.APImiddleware("deviceGroup"),
  customUiController.handleCreateGroupPage.bind(customUiController),
);

dashboardRouter.post(
  "/custom-ui/add-device",
  zodMultiValidator({ body: UpdateDeviceGroupSchema }),
  middleware.APImiddleware("deviceSettingActivate"),
  customUiController.handleUpdateGroupPage.bind(customUiController),
);
dashboardRouter.post(
  "/custom-ui/remove-device",
  zodMultiValidator({ body: UpdateDeviceGroupSchema }),
  middleware.APImiddleware("deviceSettingActivate"),
  customUiController.handleRemoveDevicePage.bind(customUiController),
);

// ─── Device Setting ────────────────────────────────────────────────
dashboardRouter.get(
  "/device-setting",
  middleware.webPageMiddleware("deviceSetting"),
  deviceSettingController.handleDeviceSettingPage.bind(deviceSettingController),
);
dashboardRouter.get(
  "/device-setting/add",
  middleware.webPageMiddleware("deviceSettingAdd"),
  deviceSettingController.handleAddDeviceSettingPage.bind(
    deviceSettingController,
  ),
);
dashboardRouter.get(
  "/device-setting/detail/:deviceId",
  middleware.webPageMiddleware("deviceSetting"),
  deviceSettingController.handleDetailDevicePage.bind(deviceSettingController),
);
dashboardRouter.post(
  "/device-setting/update/:deviceId",
  zodMultiValidator({ body: UpdateDeviceSchema }),
  middleware.webPageMiddleware("deviceSetting"),
  deviceSettingController.handleUpdateDevicePage.bind(deviceSettingController),
);
dashboardRouter.get(
  "/device-setting",
  middleware.webPageMiddleware("deviceSetting"),
  deviceSettingController.handleDeviceSettingPage.bind(deviceSettingController),
);

dashboardRouter.get(
  "/device-setting/delete/:deviceId",
  middleware.webPageMiddleware("deviceSetting"),
  deviceSettingController.handleDeleteDevicePage.bind(deviceSettingController),
);

dashboardRouter.post(
  "/device-setting/server-ip",
  middleware.APImiddleware("appSetting", { allowedRole: AllRoles }),
  zodMultiValidator({ body: UpdateIpSchema }),
  deviceSettingController.handleApiUpdateIp.bind(deviceSettingController),
);

dashboardRouter.get(
  "/device-setting/server-ip",
  middleware.APImiddleware("appSetting", { allowedRole: AllRoles }),
  deviceSettingController.handleApiGetIp.bind(deviceSettingController),
);
dashboardRouter.get(
  "/app-setting/locales",
  middleware.APImiddleware("appSetting", { allowedRole: AllRoles }),
  appSettingController.handleApiGetLocales.bind(appSettingController),
);

// ─── Notification Setting ──────────────────────────────────────────
dashboardRouter.get(
  "/notification-setting",
  middleware.webPageMiddleware("notificationSetting"),
  notificationSettingController.handleNotificationSettingPage.bind(
    notificationSettingController,
  ),
);
dashboardRouter.get(
  "/notification-setting/inactive-telegram",
  middleware.webPageMiddleware("notificationSettingActivateTelegram"),
  notificationSettingController.handleActivateTelegramAccountPage.bind(
    notificationSettingController,
  ),
);
dashboardRouter.get(
  "/notification-setting/activate-telegram/:id",
  middleware.webPageMiddleware("notificationSettingActivateTelegram"),
  notificationSettingController.handleActivateTelegramAccountSubmitPage.bind(
    notificationSettingController,
  ),
);
dashboardRouter.get(
  "/notification-setting/delete-telegram/:id",
  middleware.webPageMiddleware("notificationSettingActivateTelegram"),
  notificationSettingController.handleDeleteTelegramAccountSubmitPage.bind(
    notificationSettingController,
  ),
);
dashboardRouter.get(
  "/notification-setting/detail-telegram/:id",
  middleware.webPageMiddleware("notificationSettingActivateTelegram"),
  notificationSettingController.handleActivateTelegramAccountSubmitPage.bind(
    notificationSettingController,
  ),
);
dashboardRouter.get(
  "/notification-setting/group",
  middleware.webPageMiddleware("notificationGroup"),
  notificationSettingController.handleNotificationSettingGroupPage.bind(
    notificationSettingController,
  ),
);
dashboardRouter.get(
  "/notification-setting/group-detail/:id",
  middleware.webPageMiddleware("notificationGroup"),
  notificationSettingController.handleNotificationGroupDetailPage.bind(
    notificationSettingController,
  ),
);

dashboardRouter.post(
  "/notification-setting/add-telegram-account-group",
  zodMultiValidator({ body: AddTelegramAccountGroupSchema }),
  middleware.webPageMiddleware("notificationGroup"),
  notificationSettingController.handleAddTelegramAccountPage.bind(
    notificationSettingController,
  ),
);
dashboardRouter.get(
  "/notification-setting/delete-group/:groupId",
  middleware.webPageMiddleware("notificationGroup"),
  notificationSettingController.handleDeleteGroup.bind(
    notificationSettingController,
  ),
);
dashboardRouter.get(
  "/notification-setting/new-group/",
  middleware.webPageMiddleware("notificationGroup"),
  notificationSettingController.handleNewGroup.bind(
    notificationSettingController,
  ),
);
dashboardRouter.get(
  "/notification-setting/remove-account-group/",
  middleware.webPageMiddleware("notificationGroup"),
  notificationSettingController.handleRemoveTelegramAccountPage.bind(
    notificationSettingController,
  ),
);
dashboardRouter.post(
  "/notification-setting/update-group/:groupId",
  zodMultiValidator({ body: UpdateGroupSchema }),
  middleware.webPageMiddleware("notificationGroup"),
  notificationSettingController.handleUpdateGroup.bind(
    notificationSettingController,
  ),
);

// ─── History ───────────────────────────────────────────────────────
dashboardRouter.get(
  "/history",
  zodMultiValidator({ query: GetListRecordSchema }),
  middleware.webPageMiddleware("history", { allowedRole: AllRoles }),
  historyController.handleHistoryPage.bind(historyController),
);

dashboardRouter.get(
  "/chart",
  middleware.webPageMiddleware("chart", { allowedRole: AllRoles }),
  historyController.handleHistoryChartPage.bind(historyController),
);

// ─── Account ───────────────────────────────────────────────────────
dashboardRouter.get(
  "/account",
  middleware.webPageMiddleware("account"),
  accountController.handleAccountPage.bind(accountController),
);
dashboardRouter.get(
  "/account/create",
  middleware.webPageMiddleware("accountAdd"),
  accountController.handleAccountCreatePage.bind(accountController),
);
dashboardRouter.post(
  "/account/create",
  zodMultiValidator({ body: ActionCreateAccountBodySchema }),
  middleware.webPageMiddleware("accountAdd"),
  accountController.handleAccountCreateFormPage.bind(accountController),
);

dashboardRouter.get(
  "/account/delete/:userId",
  middleware.webPageMiddleware("accountAdd"),
  accountController.handleAccountDeleteFormPage.bind(accountController),
);

// ─── Auth ───────────────────────────────────────────────────────
dashboardRouter.get("/auth/sign-in", authController.handleSignInPage);
dashboardRouter.post(
  "/auth/sign-in",
  zodMultiValidator({ body: ActionSignInBodySchema }),
  authController.handleSignInFormPage,
);
dashboardRouter.get("/auth/sign-out", authController.handleSignOutPage);
// dashboardRouter.post("/auth/login", accountController.handleAccountAddPage);

// ─── OTA ───────────────────────────────────────────────────────
dashboardRouter.get(
  "/firmware-version",
  middleware.webPageMiddleware("firmwareVersion", { allowedRole: IsUserGroup }),
  firmwareController.handleManageFirmwarePage,
);

dashboardRouter.get(
  "/firmware-version/ota",
  middleware.webPageMiddleware("firmwareOTA", { allowedRole: IsUserGroup }),
  firmwareController.handleManageFirmwareOTAPage,
);

dashboardRouter.get(
  "/firmware/files/:filename",
  middleware.APImiddleware("appSetting", { allowedRole: AllRoles }),
  firmwareController.handleServeFirmware,
);
dashboardRouter.post(
  "/firmware/files/:filename/delete",
  middleware.webPageMiddleware("firmwareVersion", { allowedRole: IsUserGroup }),
  firmwareController.handleDeleteFirmware,
);
dashboardRouter.post(
  "/firmware/upload",
  middleware.webPageMiddleware("firmwareVersion", { allowedRole: IsUserGroup }),
  firmwareUpload.single("firmware"),
  firmwareController.handleUploadFirmware,
);
dashboardRouter.post(
  "/firmware/ota/upload",
  zodMultiValidator({ body: FirmwareOtaUploadSchema }),
  middleware.APImiddleware("firmwareOTA", { allowedRole: IsUserGroup }),
  firmwareController.handleApiUploadOta,
);
// ─── Introduction ───────────────────────────────────────────────────────

dashboardRouter.get(
  "/introduction/",
  middleware.webPageMiddleware("introduction", { allowedRole: AllRoles }),
  introductionController.handleIntroductionPage.bind(introductionController),
);

//###############################################
// ___API___
//###############################################
// chua test dto
dashboardRouter.get(
  "/firmware/device-version",
  zodMultiValidator({ query: FirmwareGetInfoSchema }),
  middleware.APImiddleware("firmwareVersion", { allowedRole: AllRoles }),
  firmwareController.handleApiGetDeviceInfo,
);

dashboardRouter.post(
  "/device-setting/connect",
  zodMultiValidator({ body: DeviceConnectSchema }),
  middleware.APImiddleware("deviceSettingAdd", { allowedRole: AllRoles }),
  deviceSettingController.handleApiDeviceConnect.bind(deviceSettingController),
);
dashboardRouter.post(
  "/device-setting/create-otp",
  middleware.webPageMiddleware("deviceSettingAdd", {
    allowedRole: IsUserGroup,
  }),
  deviceSettingController.handleCreatePairingOtpPage.bind(
    deviceSettingController,
  ),
);

// chua test dto
dashboardRouter.post(
  "/device-setting/activate",
  zodMultiValidator({ body: ActivateDeviceSchema }),
  middleware.APImiddleware("deviceSettingActivate"),
  deviceSettingController.handleApiActivateDevice.bind(deviceSettingController),
);

dashboardRouter.post(
  "/device-setting/update-status",
  zodMultiValidator({ body: UpdateDeviceStatusSchema }),
  middleware.APImiddleware("deviceSettingActivate"),
  deviceSettingController.handleApiUpdateDeviceStatus.bind(
    deviceSettingController,
  ),
);

dashboardRouter.post(
  "/device-setting/update-device-orders",
  zodMultiValidator({ body: UpdateDeviceOrdersSchema }),
  middleware.APImiddleware("deviceSettingActivate"),
  deviceSettingController.handleApiUpdateDeviceOrders.bind(
    deviceSettingController,
  ),
);
dashboardRouter.post(
  "/device-setting/create-field-config",
  zodMultiValidator({ body: CreateDeviceFieldConfigSchema }),
  middleware.webPageMiddleware("deviceSetting", { allowedRole: AllRoles }),
  deviceSettingController.handleCreateDeviceFieldConfigPage.bind(
    deviceSettingController,
  ),
);
dashboardRouter.post(
  "/device-setting/update-field-config",
  zodMultiValidator({ body: UpdateDeviceFieldConfigSchema }),
  middleware.webPageMiddleware("deviceSetting", { allowedRole: AllRoles }),
  deviceSettingController.handleUpdateDeviceFieldConfigPage.bind(
    deviceSettingController,
  ),
);
dashboardRouter.post(
  "/api/device-setting/update-group",
  zodMultiValidator({ body: UpdateDeviceGroupSchema }),
  middleware.APImiddleware("deviceSettingActivate"),
  deviceSettingController.handleApiUpdateGroup.bind(deviceSettingController),
);

dashboardRouter.get(
  "/device-setting/connection-logs",
  middleware.webPageMiddleware("deviceSettingConnectionLogs", {
    allowedRole: IsUserGroup,
  }),
  zodMultiValidator({ query: GetDeviceConnectionLogsQuerySchema }),
  deviceSettingController.handleDeviceConnectionLogsPage.bind(
    deviceSettingController,
  ),
);

// cheat
dashboardRouter.post(
  "/api/device-models/create",
  middleware.APImiddleware("deviceSettingActivate", {
    allowedRole: AllRoles,
  }),
  deviceSettingController.handleApiCreateDeviceModel.bind(
    deviceSettingController,
  ),
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
  deviceController.handleApiControlDevice.bind(deviceController),
);
dashboardRouter.get(
  "/api/device-control/:deviceId",
  middleware.webPageMiddleware("deviceControl"),
  zodMultiValidator({
    params: ApiDeviceControlParamsSchema,
  }),
  deviceController.handleApiControlDeviceGet.bind(deviceController),
);

dashboardRouter.post(
  "/device-control/logs",
  middleware.APImiddleware("deviceControl", { allowedRole: AllRoles }),
  deviceController.handleApiLogsDevice.bind(deviceController),
);

dashboardRouter.post(
  "/api/device-control/telemetry/:deviceId",
  middleware.webPageMiddleware("deviceControl", { allowedRole: AllRoles }),
  zodMultiValidator({
    body: ApiTelemetryBodySchema,
    params: ApiDeviceControlParamsSchema,
  }),
  deviceController.handleApiTelemetry.bind(deviceController),
);
