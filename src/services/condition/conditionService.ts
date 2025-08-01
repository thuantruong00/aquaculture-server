import { AutomationScene } from "~/entities/automatic-scene.entity";
import { Device } from "~/entities/device.entity";
import { DeviceFieldType, SceneStatus } from "~/utils/enum";


export class ConditionService {

  evaluateCondition = async (
    sensorValue: any,
    operator: string,
    expectedValue: any,
    valueType: DeviceFieldType
  ): Promise<boolean> => {
    const parsedSensorValue = this.castValue(sensorValue, valueType);
    const parsedExpectedValue = this.castValue(expectedValue, valueType);

    switch (operator) {
      case "eq":
      case "==":
        return parsedSensorValue == parsedExpectedValue;
      case "neq":
      case "!=":
        return parsedSensorValue != parsedExpectedValue;
      case "===":
        return parsedSensorValue === parsedExpectedValue;
      case "!==":
        return parsedSensorValue !== parsedExpectedValue;
      case "lt":
        return parsedSensorValue < parsedExpectedValue;
      case "lte":
        return parsedSensorValue <= parsedExpectedValue;
      case "gt":
        return parsedSensorValue > parsedExpectedValue;
      case "gte":
        return parsedSensorValue >= parsedExpectedValue;
      case "includes":
        return (
          typeof parsedSensorValue === "string" &&
          parsedSensorValue.includes(String(parsedExpectedValue))
        );
      case "in":
        return (
          Array.isArray(parsedExpectedValue) &&
          parsedExpectedValue.includes(parsedSensorValue)
        );
      default:
        console.warn(`⚠️ Unknown operator: ${operator}`);
        return false;
    }
  };

  private castValue(
    value: any,
    type: "integer" | "float" | "string" | "boolean"
  ): any {
    switch (type) {
      case "integer":
        return parseInt(value);
      case "float":
        return parseFloat(value);
      case "boolean":
        return value === "true" || value === true;
      case "string":
      default:
        return String(value);
    }
  }
}
