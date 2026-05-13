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

type MqttScalarValue = string | number | boolean;

const serializeMqttValue = (value: MqttScalarValue) => {
  if (typeof value === "boolean") {
    return value ? "1" : "0";
  }

  return String(value);
};

export const serializeMqttKeyValuePayload = (
  payload:
    | Record<string, MqttScalarValue>
    | Array<{ key: string; value: MqttScalarValue }>,
) => {
  const entries = Array.isArray(payload)
    ? payload
    : Object.entries(payload).map(([key, value]) => ({ key, value }));

  return entries
    .map(({ key, value }) => `${key}:${serializeMqttValue(value)}`)
    .join("|");
};

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
        if (arrTopic[4] === "setting-get") {
          mqttService.handleSettingGetResponse(arrTopic[1], arrTopic[2], msg);
          break;
        }
        if (arrTopic[4] === MqttDeviceFunction.CONNECTION_LOG) {
          mqttService.handleDeviceConnectionLog(arrTopic[1], arrTopic[2], msg);
          break;
        }
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
  value: MqttScalarValue,
  opts: { commandId: string },
) => {
  const topic =
    env.MQTT_PREFIX_TOPIC +
    "/Nzj9gp3RYJjNQ1NDdlYWM2Y2Y3ZWZjZ1/" +
    deviceId +
    "/command/set";
  const payload = serializeMqttKeyValuePayload([{ key, value }]);
  console.log("Publishing to topic:", topic, "with data:", payload);
  mqttClient.publish(topic, payload);
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

export const handleWriteSettingGet = async (
  deviceId: string,
  opts?: { commandId?: string },
) => {
  const topic =
    env.MQTT_PREFIX_TOPIC +
    "/Nzj9gp3RYJjNQ1NDdlYWM2Y2Y3ZWZjZ1/" +
    deviceId +
    "/setting/get";
  mqttClient.publish(topic, "");
  return;
};

export const handleWriteOtaUpload = async (
  zoneKey: string,
  deviceId: string,
  targetFile: string,
  secretKey: string,
) => {
  const topic =
    env.MQTT_PREFIX_TOPIC + "/" + zoneKey + "/" + deviceId + "/ota";
  const data = {
    targetFile,
    secretKey,
  };

  mqttClient.publish(topic, JSON.stringify(data));
  return {
    topic,
    payload: data,
  };
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
