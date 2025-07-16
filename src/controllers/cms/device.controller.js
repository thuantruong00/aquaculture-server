const sidebarControl = require("../../services/cms/sidebarControl");
const {
  getAllPort,
  getAllDevice,
  findDevice,
} = require("../../models/connectDB");

async function action(req, res) {
  const role_current_user = "root";

  const data = await getAllPort();
  const dataDevice = await getAllDevice();
  let arrayDevice = [];
  let arrayTemp = [];

  for (const item of dataDevice) {
    const id = item.idDevice;
    const itemDevice = data.filter(
      (i) => i.idPort === id && item.type === "light"
    );
    if (itemDevice.length > 0) {
      arrayDevice.push(itemDevice);
    }
    if (item.type === "temperature") {
      arrayTemp.push(item);
    }
  }

  for (const item of arrayDevice) {
    item.sort((a, b) => a.group - b.group);
  }

  let deviceArray = await getAllDevice();
  deviceArray = deviceArray.filter((i) => i.type === "light");
  let portArray = await getAllPort();

  let sidebar_data = await sidebarControl("a2", role_current_user);
  res.render(sidebar_data.active_page.page_name, {
    ...sidebar_data,
    arrayDevice,
    deviceArray,
    portArray,
    arrayTemp,
    layout: "./layouts/cms-layout.ejs",
  });
}

exports.action = action;
