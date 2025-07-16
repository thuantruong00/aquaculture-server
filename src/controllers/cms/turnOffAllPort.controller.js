const sidebarControl = require("../../services/cms/sidebarControl");
const {
  getAllPortIsActive,
  updateBrightnessByPortNumber,
  setInactiveTimer,
  insertHistoryEdit,
  getTemperature,
} = require("../../models/connectDB");
const { sendValue } = require("~/services/socket");
const { writeCommand } = require("~/services/serialPort/serviceSerialPort");

async function action(req, res) {
  const data = await getAllPortIsActive();
  const limitTemp = await getTemperature();

  const average = req.body.average;
  if (Number(average) > Number(limitTemp)) {
    for (const item of data) {
      const dataOff = {
        valuePort1: "0",
        valuePort2: "0",
        valueOrder: item.order,
        idDevice: item.idPort,
      };
      insertHistoryEdit({
        status: "overheating",
        idDevice: item.idPort,
        valueOrder: item.order,
        valuePort1: "0",
        valuePort2: "0",
        timestamp: new Date().getTime(),
      });
      sendValue({
        topic: item.idPort,
        data: `${item.order},0,0`,
      });
      writeCommand({
        topic: item.idDevice,
        data: `${item.order},0,0`,
      });

      await updateBrightnessByPortNumber({
        ...dataOff,
        isActive: "true",
      });
    }
    setInactiveTimer();
    res.send({ message: "ok" });
    return;
  }
  res.send({ message: "fail" });
}

exports.action = action;
