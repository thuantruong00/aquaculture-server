const {
  updateBrightnessByPortNumber,
  insertHistoryEdit,
} = require("../../models/connectDB");

async function action(req, res) {
  const role_current_user = "root";

  let data = req.body;

  const dataArray = JSON.parse(data.data);

  for (const item of dataArray) {
    const dataPort = {
      valuePort1: item.port1,
      valuePort2: item.port2,
      valueOrder: item.order,
      idDevice: item.idDevice,
      isActive: "true",
    };

    updateBrightnessByPortNumber(dataPort);

    insertHistoryEdit({
      ...dataPort,
      status: "normal",
      timestamp: new Date().getTime(),
    });
  }

  res.send(`Edit port successfully`);
}

exports.action = action;
