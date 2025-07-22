import mqtt, { MqttClient } from "mqtt";
// import { sendValueTemp } from "../socket";
// import {
//   getTemperature,
//   updateIndexTemp,
//   insertDataResearch,
// } from "~/models/connectDB";

// interface Command {
//   topic: string;
//   data: string;
// }

export const mqttClient: MqttClient = mqtt.connect(
  process.env.MQTT_HOST || "",
  {
    username: process.env.MQTT_USERNAME || "",
    password: process.env.MQTT_PWD || "",
    port: Number(process.env.MQTT_PORT || "1883"),
  }
);

mqttClient.on("connect", () => {
  console.log("MQTT connected to broker:", process.env.MQTT_HOST);
  mqttClient.subscribe("presence", (err) => {
    if (err) {
      console.error("❌ Failed to subscribe to 'presence':", err.message);
    }
  });

  mqttClient.subscribe("temp", (err) => {
    if (err) {
      console.error("❌ Failed to subscribe to 'temp':", err.message);
    }
  });
});

mqttClient.on("message", (topic: string, message: Buffer) => {
  const msg = message.toString();

  if (topic === "temp") {
    const resTemp = msg.split(",");

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

    console.log("Received temp:", data);
    // sendValueTemp(data);

    // insertDataResearch({
    //   idDevice: resTemp[0],
    //   humidity: Number(resTemp[1]),
    //   temperature: Number(resTemp[2]),
    //   ph: Number(resTemp[3]),
    //   tds: Number(resTemp[4]),
    //   nitro: Number(resTemp[5]),
    //   phos: Number(resTemp[6]),
    //   pota: Number(resTemp[7]),
    //   timestamp: Date.now().toString(),
    // });
  }
});

// export const writeCommand = async (command: Command): Promise<boolean> => {
//   try {
//     client.publish(command.topic, command.data);
//     return true;
//   } catch (error) {
//     console.error("❌ Failed to publish command:", error);
//     return false;
//   }
// };
