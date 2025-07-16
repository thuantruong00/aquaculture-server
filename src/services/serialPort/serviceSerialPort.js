const mqtt = require("mqtt");
const { sendValueTemp } = require("../socket");
const {
  getTemperature,
  updateIndexTemp,
  insertDataResearch,
} = require("~/models/connectDB");
const client = mqtt.connect(process.env.MQTT_HOST, {
  username: process.env.MQTT_USERNAME || "",
  password: process.env.MQTT_PWD || "",
  port: Number(process.env.MQTT_PORT),
});
client.on("connect", () => {
  client.subscribe("presence", (err) => {
    if (!err) {
      // client.publish("presence", "1111");
    }
  });
  //nhiet do
  client.subscribe("temp", (err) => {
    console.log(err);
    if (!err) {
    }
  });
  client.on("message", (topic, message) => {
    // message is Buffer

    console.log(topic);
    const msg = message.toString().split(",");

    const data = new Date().toLocaleTimeString("vi-VI", {
      hour12: false,
      hour: "numeric",
      minute: "numeric",
    });

    if (topic === "temp") {
      const resTemp = message.toString().split(",");
      // const data2 = {
      //     idDevice: "t2",
      //     humidity: random(1, 100),
      //     temperature: temp2,
      //     limitTemp,
      //     status: "value",
      //   };
      //   sendValueTemp(data1);
     
      const data = {
        idDevice: resTemp[0],
        humidity: resTemp[1],
        temperature: resTemp[2],
        ph: resTemp[3],
        tds: resTemp[4],
        nitro: resTemp[5],
        phos: resTemp[6],
        pota: resTemp[7],
        status: "value",

      };
      console.log(data)
      sendValueTemp(data);
      insertDataResearch({
        idDevice: resTemp[0],
        humidity: Number(resTemp[1]),
        temperature: Number(resTemp[2]),
        ph: Number(resTemp[3]),
        tds: Number(resTemp[4]),
        nitro: Number(resTemp[5]),
        phos: Number(resTemp[6]),
        pota: Number(resTemp[7]),
        timestamp: new Date().getTime() + "",
      });
    }
  });
});

const writeCommand = async (command) => {
  // command={topic, data}
  // write,data
  // console.log("command", command);
  client.publish("device1", command.data);
  // client.publish(command.topic, command.data);

  try {
  } catch (error) {}

  return true;
};

exports.writeCommand = writeCommand;
