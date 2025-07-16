const { Parser } = require("json2csv");
const stream = require("stream");
const fs = require("fs");
const {
  filterHistory,
  getAllDevice,
  getDataResearch,
} = require("../../models/connectDB");

async function action(req, res) {
  let r = { ...req.body };

  let arrayIdPort = r["arrayIdPort[]"] ? r["arrayIdPort[]"] : [];
  if (typeof arrayIdPort === "string") {
    arrayIdPort = [arrayIdPort];
  }

  let dataResearch = [];
  if (arrayIdPort.length > 0) {
    let data = {
      idDevice: { $in: arrayIdPort },
      timestamp: {
        $gte: r.timestampFromDate,
        $lte: r.timestampToDate,
      },
    };

    dataResearch = await getDataResearch(data);
  }

  // const json2csvParser = new CsvParser();
  // const csvData = json2csvParser.parse(dataResearch);

  // // Set headers to indicate a file attachment and specify the filename
  // res.header("Content-Type", "text/csv");
  // res.attachment("exported_data.csv");
  // res.send(csvData);

  let dataExport = [];

  dataResearch.forEach((item) => {
    const {
      idDevice,
      humidity,
      temperature,
      pH,
      TDS,
      nitro,
      phos,
      stat,
      timestamp,
    } = item;
    dataExport.push({
      idDevice,
      humidity,
      temperature,
      pH,
      TDS,
      nitro,
      phos,
      stat,
      timestamp,
    });
  });

  const csvFields = [
    "idDevice",
    "humidity",
    "temperature",
    "pH",
    "TDS",
    "nitro",
    "phos",
    "stat",
    "timestamp",
  ];

  const parser = new Parser({
    csvFields,
  });

  const csv = parser.parse(dataExport);
  // console.log(csv);
  var fileContents = Buffer.from(
    JSON.stringify({
      sampleTime: "1450632410296",
      sampleData: "1234567890",
    })
  );

  var readStream = new stream.PassThrough();
  readStream.end(csv);

  res.set("Content-disposition", "attachment; filename=" + Date.now() + ".csv");
  res.set("Content-Type", "text/csv");

  readStream.pipe(res);

  // res.header("Content-Type", "text/csv");
  // res.attachment(Date.now + ".csv");
  // res.send(data);

  // const csvParser = new CsvParser({ csvFields });
  // const csvData = csvParser.parse(dataExport);

  // res.setHeader("Content-Type", "text/csv");
  // res.setHeader(
  //   "Content-Disposition",
  //   `attachment: filename=${Date.now()}.csv`
  // );
  // res.status(200).end(csv);
}

exports.action = action;
