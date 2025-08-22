import mqtt, { MqttClient } from "mqtt";
import { env } from "~/utils";
import { extractZoneKey } from "~/utils/mqtt";
import { MqttService } from "./mqttService";
import { MqttDeviceFunction } from "~/utils/enum";
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
const mqttService = new MqttService();

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
  mqttClient.subscribe("platform/+/+/telemetry", (err) => {
    if (err) {
      console.error("❌ Failed to subscribe to 'temp':", err.message);
    }
  });
  mqttClient.subscribe("platform/+/+/response/+", (err) => {
    if (err) {
      console.error("❌ Failed to subscribe to 'temp':", err.message);
    }
  });
  // mqttClient.subscribe("platform/+/+/command", (err) => {
  //   if (err) {
  //     console.error("❌ Failed to subscribe to 'temp':", err.message);
  //   }
  // });
});

mqttClient.on("message", async (topic: string, message: Buffer) => {
  const msg = message.toString();
  console.log(topic, msg);
  // platform/<zone>/<clientID>/<method>
  // telemetry payload : <key1>:<value1>|<key2>:<value2>
  // response payload:  <key1>:<value1>
  const arrTopic = topic.split("/");
  const isMatchZone = extractZoneKey(arrTopic[1]);
  if (isMatchZone && isMatchZone.status) {
    switch (arrTopic[3]) {
      case MqttDeviceFunction.TELEMETRY:
        mqttService.handlTetelemetry(arrTopic[1], arrTopic[2], msg);
        break;
      case MqttDeviceFunction.RESPONSE:
        mqttService.handlResponse(arrTopic[1], arrTopic[2], arrTopic[4], msg);
        break;

      default:
        break;
    }
  }
  // if (topic === "temp") {
  //   const resTemp = msg.split(",");

  //   const data = {
  //     idDevice: resTemp[0],
  //     humidity: resTemp[1],
  //     temperature: resTemp[2],
  //     ph: resTemp[3],
  //     tds: resTemp[4],
  //     nitro: resTemp[5],
  //     phos: resTemp[6],
  //     pota: resTemp[7],
  //     status: "value",
  //   };

  //   console.log("Received temp:", data);
  //   // sendValueTemp(data);

  //   // insertDataResearch({
  //   //   idDevice: resTemp[0],
  //   //   humidity: Number(resTemp[1]),
  //   //   temperature: Number(resTemp[2]),
  //   //   ph: Number(resTemp[3]),
  //   //   tds: Number(resTemp[4]),
  //   //   nitro: Number(resTemp[5]),
  //   //   phos: Number(resTemp[6]),
  //   //   pota: Number(resTemp[7]),
  //   //   timestamp: Date.now().toString(),
  //   // });
  // }
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

export const handleWriteCommandSet = async (
  deviceId: string,
  key: string,
  value: string | number | boolean,
  opts: { commandId: string }
) => {
  const topic =
    env.MQTT_PREFIX_TOPIC +
    "/Nzj9gp3RYJjNQ1NDdlYWM2Y2Y3ZWZjZ1/" +
    deviceId +
    "/command/set/" +
    (opts.commandId ?? "undefined");
  const data = key + ":" + value;
  mqttClient.publish(topic, data);
  return;
};
export const handleWriteCommandGet = async (
  deviceId: string,
  key: string,
  value: string | number | boolean,
  opts?: { commandId?: string }
) => {
  const topic =
    env.MQTT_PREFIX_TOPIC +
    "/Nzj9gp3RYJjNQ1NDdlYWM2Y2Y3ZWZjZ1/" +
    deviceId +
    "/command/get";
  const data = key + ":" + value;
  mqttClient.publish(topic, data);
  return;
};
