const sidebarControl = require("../../services/cms/sidebarControl");
const {
  filterHistory,
  getAllDevice,
  getAllTemp,
} = require("../../models/connectDB");

async function action(req, res) {
  const role_current_user = "root";
  let sidebar_data = await sidebarControl("a5", role_current_user);

  const dataDevice = await getAllTemp({ idDevice: "#" });
  const arrayName = dataDevice.map((item) => item.idDevice);

  console.log(arrayName);

  res.render(sidebar_data.active_page.page_name, {
    ...sidebar_data,
    arrayName,
    layout: "./layouts/cms-layout.ejs",
  });
}

exports.action = action;
