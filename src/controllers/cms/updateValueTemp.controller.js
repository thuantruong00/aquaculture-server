const {
  getAllTemp,
  updateInfoTemp,
  updateIndexTemp,
} = require("../../models/connectDB");

async function action(req, res) {
  const data = { ...req.body };
  const arrayTemp = await getAllTemp(data);

  if (data?.status === "info") {
    let groupExists = false;
    let nameExists = false;
    for (const item of arrayTemp) {
      if (item.group !== "" && item.group === data?.group) {
        groupExists = true;
      }
      if (item.name !== "" && item.name === data?.name) {
        nameExists = true;
      }
    }
    if (nameExists) {
      res.send({
        message: "Name does exits",
      });
      return;
    }
    if (groupExists) {
      res.send({
        message: "Group does exits",
      });
      return;
    }

    await updateInfoTemp(data);
    res.send({
      message: "Update info successfully",
    });
  } else if (data?.status === "value") {
    await updateIndexTemp(data);
    const dataTemp = await getAllTemp("#");

    const array = dataTemp.map((item) => {
      return item.valueTemperature;
    });
    res.send({
      average: average(array),
    });
  }
}

function average(arr) {
  if (arr.length === 0) {
    return 0;
  }

  const sum = arr.reduce((total, number) => total + Number(number), 0);
  return (sum / arr.length).toFixed(2);
}

exports.action = action;
