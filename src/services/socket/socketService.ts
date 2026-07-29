import { Server, Socket } from "socket.io";
import { createServer, Server as HTTPServer } from "http";
import express, { Express } from "express";
import { env } from "~/utils";

const socketApp = express();
const server = createServer(socketApp);
server.listen(Number(env.SOCKET_PORT));
export const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins
    methods: ["GET", "POST"],
  },
});

io.on("connection", (client) => {
  console.log("client-id", client.id);

  client.on("chat message", (msg) => {
    console.log(msg);

    // Broadcast the message to all connected clients
    io.emit("chat message", msg);
  });
});

export class SocketService {
  public sendIotDataTelemetry(data: any) {
    io.emit("iotDataTelemetry", data);
  }
  public sendIotDataResponse(data: any) {
    io.emit("iotDataResponse", data);
  }
  public sendDeviceSettingInfo(data: any) {
    io.emit("deviceSettingInfo", data);
  }

  public sendValueTemp(data: any) {
    io.emit("temp", data);
  }
}
