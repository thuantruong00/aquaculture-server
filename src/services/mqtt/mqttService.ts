import { DeviceRecord } from "~/entities/device-record.entity";
import { Device } from "~/entities/device.entity";
import { SocketService } from "../socket";
import { DeviceFieldType } from "~/utils/enum";
import { float32, int32 } from "zod";
import { Int32 } from "typeorm";
import { IDeviceModel } from "~/entities/device-model.entity";

export class MqttService {
  private socketService: SocketService;
  constructor() {
    this.socketService = new SocketService();
  }
  handlTetelemetry = async (
    zoneId: string,
    deviceId: string,
    value: string
  ) => {
    console.log("handlTetelemetry");
    const findDevice = await Device.findOne({ _id: deviceId })
      .populate("zone")
      .populate("group")
      .populate("deviceModel");
    if (findDevice) {
      const arrStringValue = value.split("|");
      console.log(arrStringValue);
      if (arrStringValue.length > 0) {
        const valueInsert = [];
        for (const item of arrStringValue) {
          const arrKeyValue = item.split(":");
          console.log(arrKeyValue);
          valueInsert.push({
            key: arrKeyValue[0],
            value: arrKeyValue[1],
          });
        }
        const ts = Date.now().valueOf();
        const insert = await DeviceRecord.insertOne({
          deviceId: deviceId,
          values: valueInsert,
        });
        console.log(insert);
        this.socketService.sendIotDataTelemetry({
          id: deviceId,
          ts: ts,
          devices: valueInsert,
        });
      }
    }
    return;
  };

  handlResponse = async (
    zoneId: string,
    deviceId: string,
    commandId: string,
    value: string
  ) => {
    console.log("handlResponse");
    const findDevice = await Device.findOne({ _id: deviceId })
      .populate("zone")
      .populate("group")
      .populate("deviceModel");
    if (findDevice && findDevice.deviceModel) {
      const arrStringValue = value.split(":");
      const deviceModel = findDevice.deviceModel as unknown as IDeviceModel;
      const valueType = deviceModel.fields[0].valueType;

      if (arrStringValue.length > 0) {
        const key = arrStringValue[0];
        const value = arrStringValue[1];
        const ts = Date.now().valueOf();

        this.socketService.sendIotDataResponse({
          id: deviceId,
          ts: ts,
          template: deviceModel.template,
          field: {
            key: key,
            value: typeCast(value, valueType),
            valueType: valueType,
          },
        });
      }
    }
    return;
  };
}
const typeCast = (value: string, type: string) => {
  let newValue;
  switch (type) {
    case DeviceFieldType.BOOLEAN:
      newValue = Boolean(Number(value));
      break;
    case DeviceFieldType.FLOAT:
      newValue = float32(value);
      break;
    case DeviceFieldType.INTEGER:
      newValue = int32(value);
      break;
    case DeviceFieldType.STRING:
    default:
      newValue = value;

      break;
  }
  return newValue;
};
