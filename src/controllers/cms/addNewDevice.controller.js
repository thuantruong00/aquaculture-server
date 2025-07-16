const sidebarControl = require("../../services/cms/sidebarControl");
const {
  insertDevice,
  insertPortOfDevice,
  findDeviceByID,
} = require("../../models/connectDB");
const { group } = require("console");
async function action(req, res) {
  const countPortInDevice = 8;
  const idDevice = req.body.idDevice;
  const type = req.body.type;

  const check = await findDeviceByID(idDevice);

  if (check.length === 0) {
    if (type === "light") {
      await insertDevice({ countPortInDevice, idDevice, type });
      let dataPort = [];
      for (let i = 0; i < countPortInDevice; i++) {
        dataPort.push({
          name: "Name " + i,
          order: i,
          idPort: idDevice,
          group: i,
          port1: 0,
          port2: 0,
          colorPort1: "blue",
          colorPort2: "blue",
          isActive: "false",
        });
      }
      await insertPortOfDevice(dataPort);
      res.send({ errCode: 0, message: "Add device successfully" });
    } else {
      await insertDevice({
        idDevice,
        type,
        name: idDevice,
        group: "0",
        valueTemperature: 0,
        valueHumidity: 0,
      });
      res.send({ errCode: 0, message: "Add device successfully" });
    }
  } else {
    res.send({ errCode: 1, message: "Port has exits!!!" });
  }
}

exports.action = action;
