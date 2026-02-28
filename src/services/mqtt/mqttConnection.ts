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
  },
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
        mqttService.handleTetelemetry(arrTopic[1], arrTopic[2], msg);
        break;
      case MqttDeviceFunction.RESPONSE:
        mqttService.handlResponse(arrTopic[1], arrTopic[2], arrTopic[4], msg);
        break;

      default:
        break;
    }
  }
});

export const handleWriteCommandSet = async (
  deviceId: string,
  key: string,
  value: string | number | boolean,
  opts: { commandId: string },
) => {
  const topic =
    env.MQTT_PREFIX_TOPIC +
    "/Nzj9gp3RYJjNQ1NDdlYWM2Y2Y3ZWZjZ1/" +
    deviceId +
    "/command/set";
  const data = { key, value };
  console.log("Publishing to topic:", topic, "with data:", data);
  mqttClient.publish(topic, JSON.stringify(data));
  return;
};
export const handleWriteCommandGet = async (
  deviceId: string,
  opts?: { commandId?: string },
) => {
  const topic =
    env.MQTT_PREFIX_TOPIC +
    "/Nzj9gp3RYJjNQ1NDdlYWM2Y2Y3ZWZjZ1/" +
    deviceId +
    "/command/get";
  mqttClient.publish(topic, "");
  return;
};

export const handlePushLogs = async (deviceId: string, msg: string) => {
  const topic =
    env.MQTT_PREFIX_TOPIC +
    "/Nzj9gp3RYJjNQ1NDdlYWM2Y2Y3ZWZjZ1/" +
    deviceId +
    "/log/";
  mqttClient.publish(topic, msg);
  return;
};
