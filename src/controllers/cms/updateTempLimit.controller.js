const { insertTimer, insertTemperature } = require("../../models/connectDB");

async function action(req, res) {
  const role_current_user = "root";

  const data = req.body?.temp;

  const resDB = await insertTemperature(data);
  if (resDB) {
    res.send({ message: "Update temperature successfully" });
  } else {
    res.send({ message: "Update temperature failure" });
  }
}

exports.action = action;
