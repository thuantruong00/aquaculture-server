const { ObjectId } = require("mongodb");
const {
  insertTimer,
  insertTemperature,
  changeStatusTimer,
} = require("../../models/connectDB");

async function action(req, res) {
  const role_current_user = "root";
  const _id = req.body._id;
  const status = req.body.status;
  const data = { _id, status };
  const resDB = await changeStatusTimer(data);
  res.send({ status: resDB.status });
}

exports.action = action;
