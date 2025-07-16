const {
  getNewRecordNormal,
  updateBrightnessByPortNumber,
} = require("~/models/connectDB");
const { writeCommand } = require("~/services/serialPort/serviceSerialPort");
const { sendValue } = require("~/services/socket");

async function action(req, res) {
  const role_current_user = "root";
  let data = req.body;

  const dataArray = JSON.parse(data.data);
  console.log(dataArray);

  if (dataArray.length > 0) {
    for (const item of dataArray) {
      const redDB = await getNewRecordNormal(item);
      const data = redDB.insertResult;
      console.log(data);
      if (!data) {
        res.send("fail");
        return;
      }
      await updateBrightnessByPortNumber({
        valueOrder: item.order,
        idDevice: item.idDevice,
        valuePort1: data.valuePort1,
        valuePort2: data.valuePort2,
        isActive: "true",
      });
      sendValue({
        topic: data.idDevice,
        data: `${data.valueOrder},${data.valuePort1},${data.valuePort2}`,
      });
      writeCommand({
        topic: item.idDevice,
        data: `${item.valueOrder},${item.valuePort1},${item.valuePort2}`,
      });
    }
  }
  res.send("ok");
}

exports.action = action;
