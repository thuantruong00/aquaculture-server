const express = require("express");
const router = express.Router();

// _____ _____[]_____[]_____[ * ]_____[]_____[]_____ _____
const cors_conf = require("../../config/config.json").cors;

// _____ _____[]_____[]_____[controller]_____[]_____[]_____ _____
const controlDeviceController = require("../../controllers/cms/controlDevice.controller");
const editDeviceController = require("../../controllers/cms/editDevice.controller");
const deviceController = require("../../controllers/cms/device.controller");
const editPortController = require("../../controllers/cms/editPort.controller");
const configController = require("../../controllers/cms/config.controller");
const dataController = require("../../controllers/cms/data.controller");
const filterData = require("../../controllers/cms/filterData.controller");
const infoController = require("../../controllers/cms/info.controller");
// const postDeviceController = require("../../controllers/cms/postDevice.controller");
const addDeviceController = require("../../controllers/cms/addDevice.controller");
const recoverDeviceController = require("../../controllers/cms/recoverDevice.controller");
const findPortByUSBController = require("../../controllers/cms/findPortByUSB.controller");
const getInfoPortByUSBController = require("../../controllers/cms/getInfoPortByUSB.controller");
// const addAddDeviceController = require("../../controllers/cms/addAddDevice.controller");
const exportDataController = require("../../controllers/cms/exportData.controller");
const exportCSVController = require("../../controllers/cms/exportCSV.controller");
const setTimerController = require("../../controllers/cms/setTimer.controller");
const historyTimerController = require("../../controllers/cms/historyTimer.controller");
const saveSetTimerController = require("../../controllers/cms/saveSetTimer.controller");
const deleteTimerController = require("../../controllers/cms/deleteTimer.controller");
const addNewDeviceController = require("../../controllers/cms/addNewDevice.controller");
const customLedController = require("../../controllers/cms/customLed.controller");
const turnOffAllPortController = require("../../controllers/cms/turnOffAllPort.controller");
const setTempController = require("../../controllers/cms/temp.controller");
const updateTempLimitController = require("../../controllers/cms/updateTempLimit.controller");
const updateValueTempController = require("../../controllers/cms/updateValueTemp.controller");
const changeStatusTimerController = require("../../controllers/cms/changeStatusTimer.controller");

// _____ _____[]_____[]_____[ router ]_____[]_____[]_____ _____

//Điều khiển thiết bị
router.get("/control-device", (req, res) => {
  controlDeviceController.action(req, res);
});

router.post("/control-device/custom-led", (req, res) => {
  customLedController.action(req, res);
});

//Chỉnh sửa thiết bị
router.get("/edit-device", (req, res) => {
  deviceController.action(req, res);
});

router.post("/edit-device/update", (req, res) => {
  editPortController.action(req, res);
});

//Them thiet bi
router.get("/add-device", (req, res) => {
  addDeviceController.action(req, res);
});

router.get("/add-device/find", (req, res) => {
  findPortByUSBController.action(req, res);
});

router.get("/add-device/get-info", (req, res) => {
  getInfoPortByUSBController.action(req, res);
});

// router.post("/add-device/add", (req, res) => {
//   addAddDeviceController.action(req, res);
// });

router.post("/add-device/add-mqtt-device", (req, res) => {
  addNewDeviceController.action(req, res);
});

router.post("/control/edit", (req, res) => {
  editDeviceController.action(req, res);
});

router.post("/control/update", (req, res) => {
  editPortController.action(req, res);
});

router.post("/control/add", (req, res) => {
  findPortByUSBController.action(req, res);
});

router.post("/control/recover", (req, res) => {
  recoverDeviceController.action(req, res);
});

//config
router.get("/config", (req, res) => {
  configController.action(req, res);
});

router.get("/data", (req, res) => {
  dataController.action(req, res);
});

router.post("/data/filter", (req, res) => {
  filterData.action(req, res);
});

router.get("/info", (req, res) => {
  infoController.action(req, res);
});

router.post("/export-csv", (req, res) => {
  exportDataController.action(req, res);
});
router.get("/export-csv-file", (req, res) => {
  exportCSVController.action(req, res);
});

router.get("/timer/set", (req, res) => {
  setTimerController.action(req, res);
});

router.post("/timer/set", (req, res) => {
  saveSetTimerController.action(req, res);
});

router.get("/timer/history", (req, res) => {
  historyTimerController.action(req, res);
});

router.post("/timer/history", (req, res) => {
  deleteTimerController.action(req, res);
});

router.post("/edit/turn-off", (req, res) => {
  turnOffAllPortController.action(req, res);
});

router.get("/set-temp", (req, res) => {
  setTempController.action(req, res);
});

router.post("/set-temp/update", (req, res) => {
  updateTempLimitController.action(req, res);
});

router.post("/edit-device/update-temp", (req, res) => {
  updateValueTempController.action(req, res);
});
router.post("/timer/history/change-status", (req, res) => {
  changeStatusTimerController.action(req, res);
});

module.exports.cmsRouter = router;
