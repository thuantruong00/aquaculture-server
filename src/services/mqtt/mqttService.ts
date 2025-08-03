import { DeviceRecord } from "~/entities/device-record.entity";
import { Device } from "~/entities/device.entity";
import { SocketService } from "../socket";
import {
  ActionStatus,
  DeviceFieldType,
  DeviceType,
  SceneStatus,
} from "~/utils/enum";
import { float32, int32 } from "zod";
import { Int32 } from "typeorm";
import { DeviceModel, IDeviceModel } from "~/entities/device-model.entity";
import { ConditionService } from "../condition";
import { Action, IAction } from "~/entities/automatic-scene-action.entity";
import { AutomationScene } from "~/entities/automatic-scene.entity";
import { handleWriteCommandGet, handleWriteCommandSet } from "./mqttConnection";
export interface SensorDataConditionProcesss {
  key: string;
  value: string | number | boolean;
}
export class MqttService {
  private socketService: SocketService;
  private conditionService: ConditionService;
  constructor() {
    this.socketService = new SocketService();
    this.conditionService = new ConditionService();
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
    if (findDevice && findDevice.deviceModel) {
      const arrStringValue = value.split("|");
      if (arrStringValue.length > 0) {
        const valueInsert = [];
        for (const item of arrStringValue) {
          const arrKeyValue = item.split(":");
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
        const check = await this.processSensorValue(deviceId, valueInsert);
        console.log("check ====");
        // ========================

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
        console.log(value, typeCast(value, valueType), deviceModel);
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
  processSensorValue = async (
    deviceId: string,
    data: SensorDataConditionProcesss[]
  ) => {
    console.log(deviceId, data);
    if (data.length > 0) {
      for (const item of data) {
        const findScene = await AutomationScene.findOne({
          status: SceneStatus.ACTIVE,
          conditions: {
            $elemMatch: {
              device: deviceId,
              key: item.key,
            },
          },
        }).populate<{ actions: IAction[] }>("actions");
        console.log(findScene);
        const expected = findScene?.conditions.find(
          (cond) => cond.key == item.key
        );
        if (expected?.operator) {
          const check = await this.conditionService.evaluateCondition(
            item.value,
            expected?.operator,
            expected?.value,
            DeviceFieldType.FLOAT
          );
          console.log("check = ", check);
          if (check) {
            await this.handleAction(findScene?.actions);

            return;
          }
        }
      }
    }

    return false;
  };
  processByActionId = async (actionId: string) => {
    const action = await Action.findOne({ _id: actionId }).lean<IAction>();
    if (!action) throw new Error("Action not found");
    await this.handleAction([action]);
  };

  handleAction = async (actions: IAction[] | undefined | null) => {
    if (actions && actions.length > 0) {
      for (const action of actions) {
        for (const step of action.steps) {
          if (step.deviceType == DeviceType.ACTUATOR) {
            await handleWriteCommandSet(
              String(step.deviceId),
              step.key,
              Number(step.value),
              { commandId: "xxxId" }
            );
          }
          if (step.deviceType == DeviceType.SENSOR) {
            await handleWriteCommandGet(
              String(step.deviceId),
              step.key,
              Number(step.value)
            );
          }
        }
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
