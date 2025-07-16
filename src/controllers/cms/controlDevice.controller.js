const sidebarControl = require("../../services/cms/sidebarControl");
const {
  getAllPort,
  getAllDevice,
  getTemperature,
  getAllTemp,
  getAllPortIsActive,
} = require("../../models/connectDB");
async function action(req, res) {
  const role_current_user = "root";
  let sidebar_data = await sidebarControl("a1", role_current_user);

  const data = await getAllPortIsActive();
  const dataDevice = await getAllDevice();
  const dataTemp = await getAllTemp({ idDevice: "#" });
  const dataLimit = (await getTemperature()) || "NaN";

  let arrayDevice = [];
  let array = [];

  for (const item of dataDevice) {
    const id = item.idDevice;
    const itemDevice = data.filter(
      (i) => i.idPort === id && i.isActive == "true"
    );

    if (itemDevice.length > 0) {
      arrayDevice = itemDevice;
    }
  }

  const mergedArray = data.map((item2) => {
    const matchingItem = dataTemp.find((item1) => item1.group === item2.group);
    if (matchingItem) {
      return {
        ...item2,
        valueTemperature: matchingItem.valueTemperature,
        valueHumidity: matchingItem.valueHumidity,
        idDevice: matchingItem.idDevice,
      };
    }
    return item2;
  });
  console.log(mergedArray);

  mergedArray.sort((a, b) => a.group - b.group);

  array = [mergedArray];

  console.log("array", array);
  console.log("arrayDevice", arrayDevice);

  res.render(sidebar_data.active_page.page_name, {
    array,
    arrayDevice,
    dataLimit,
    ...sidebar_data,
    layout: "./layouts/cms-layout.ejs",
  });
}

exports.action = action;
