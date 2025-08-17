const { filterHistory, getAllDevice } = require("../../models/connectDB");

async function action(req, res) {
  let r = { ...req.body };

  let arrayIdPort = r["arrayIdPort[]"] ? r["arrayIdPort[]"] : [];
  if (typeof arrayIdPort === "string") {
    arrayIdPort = [arrayIdPort];
  }

  let arrayResult = [];
  if (arrayIdPort.length > 0) {
    for (const item of arrayIdPort) {
      let data = {
        idDevice: item,
        timestamp: {
          $gte: r.timestampFromDate,
          $lte: r.timestampToDate,
        },
      };
      console.log(data);

      let result = await filterHistory(data);
      arrayResult.push(result);
    }
  }
  console.log("r", arrayResult);
  res.send(arrayResult);
}

exports.action = action;
