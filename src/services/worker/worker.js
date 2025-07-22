const { CronJob } = require("cron");
const {
  getAllTimerIsActive,
  updatePortByPortNumber,
  updateBrightnessByPortNumber,
  insertHistoryEdit,
} = require("../../entities/connectDB");
const { writeCommand } = require("../mqtt/handleMqtt");
const { sendValue } = require("../socket");

const worker = async () => {
  const data = new Date().toLocaleTimeString("vi-VI", {
    hour12: false,
    hour: "numeric",
    minute: "numeric",
  });
  const timeArray = data.split(":");
  const hourGMT0 = Number(timeArray[0]) + 7;
  const hour = hourGMT0 <= 23 ? hourGMT0 : hourGMT0 - 24;
  const arrayTimerActive = await getAllTimerIsActive(hour + "");
  let arrayTimerOn = [];
  for (const item of arrayTimerActive) {
    if (
      Number(item.valueMinute) == Number(timeArray[1]) ||
      Number(item.valueMinute) == Number(timeArray[1] - 1)
    ) {
      arrayTimerOn.push(item);
    }
  }
  let i = 0;
  const timeOn = () =>
    setInterval(() => {
      const item = arrayTimerOn[i];
      if (item) {
        writeCommand({
          topic: item.idDevice,
          data: `${item.valueOrder},${item.valuePort1},${item.valuePort2}`,
        });
        sendValue({
          topic: item.idDevice,
          data: `${item.valueOrder},${item.valuePort1},${item.valuePort2}`,
        });

        updateBrightnessByPortNumber({
          ...item,
          isActive: item.status === "active" ? "true" : "false",
        });

        insertHistoryEdit({
          status: "normal",
          idDevice: item.idDevice,
          valueOrder: item.valueOrder,
          valuePort1: item.valuePort1,
          valuePort2: item.valuePort2,
          timestamp: new Date().getTime(),
        });
      }
      i++;
      if (i > arrayTimerOn.length - 1) {
        clearInterval(timeOn);
      }
    }, 2000);
  if (arrayTimerOn.length > 0) {
    timeOn();
  }
};

// const job = new CronJob(
//   "*/10 * * * * *", // cronTime
//   function () {
//     console.log("flag");
//     worker();
//   }, // onTick
//   null, // onComplete
//   true, // start
//   "America/Los_Angeles" // timeZone
// );

// const startJob = () => {
//   job.start();
// };

function getRandomNumber() {
  return Math.floor(Math.random() * (100 - 1 + 1)) + 1;
}

// Example usage:

exports.worker = worker;
exports.startJob = startJob;
