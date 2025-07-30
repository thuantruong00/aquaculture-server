import dotenv from "dotenv";

dotenv.config();

export const env = {
  DB_CONNECT_STRING: process.env.DB_CONNECT_STRING || "",
  MQTT_HOST: process.env.MQTT_HOST,
  MQTT_PORT: process.env.MQTT_PORT || 1883,
  MQTT_USERNAME: process.env.MQTT_USERNAME || "default_user",
  MQTT_PWD: process.env.MQTT_PWD || "default_pwd",
  SOCKET_HOST: process.env.SOCKET_HOST || "127.0.0.1",
  SOCKET_PORT: process.env.SOCKET_PORT || 3000,
  MQTT_PREFIX_TOPIC: process.env.MQTT_PREFIX_TOPIC,
  ZONE_SECRET: process.env.ZONE_SECRET,
};
