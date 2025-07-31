import { Request, Response } from "express";
import { BaseController } from "../dashboard.base-controller";
import { Device } from "~/entities/device.entity";
import {
  ComparisonOperator,
  ComparisonOperatorSymbol,
  DeviceStatus,
  LogicOperator,
  LogicOperatorLabel,
  SceneStatus,
} from "~/utils/enum";
import { DeviceModel } from "~/entities/device-model.entity";
import { IAutomaticSceneSaveBodySchema } from "./automatic.dto";
import { AutomationScene } from "~/entities/automatic-scene.entity";

export class AutomaticController extends BaseController {
  handleAutomaticPage = async (req: Request, res: Response) => {
    try {
      const findScene = await AutomationScene.find({
        status: { $ne: SceneStatus.DELETED },
      });
      this.renderWithSidebar(res, undefined, {
        scenes: findScene,
      });
    } catch (error) {
      console.log(error);
      return this.renderWithSidebar(res, "page/error", {
        layout: "/layouts/default-layout.ejs",
      });
    }
  };
  handleAutomaticSceneCreatePage = async (req: Request, res: Response) => {
    try {
      const result = await Device.aggregate([
        {
          $match: {
            status: DeviceStatus.ACTIVE,
          },
        },
        {
          $lookup: {
            from: "devicemodels",
            localField: "deviceModel",
            foreignField: "_id",
            as: "deviceModel",
          },
        },
        { $unwind: "$deviceModel" },
        { $unwind: "$deviceModel.fields" },
        {
          $match: {
            "deviceModel.fields.deviceType": "sensor",
          },
        },
        {
          $project: {
            label: {
              $concat: ["$name", " - ", "$deviceModel.fields.label"],
            },
            source: {
              $literal: "device", // 👈 hoặc Enum nếu bạn import EnumSource.device vào đây
            },
            deviceId: "$_id",
            key: "$deviceModel.fields.key",
          },
        },
      ]);

      const comparisonOperators = Object.entries(ComparisonOperator).map(
        ([key, value]) => ({
          value, // "lt", "lte", etc.
          label:
            ComparisonOperatorSymbol[
              key as keyof typeof ComparisonOperatorSymbol
            ] ?? value,
        })
      );

      const logicOperator = Object.entries(LogicOperator).map(
        ([key, value]) => ({
          value, //
          label:
            LogicOperatorLabel[key as keyof typeof LogicOperatorLabel] ?? value,
        })
      );

      console.log(comparisonOperators);
      this.renderWithSidebar(res, undefined, {
        comparisonOperators,
        logicOperator,
        devices: result,
        status: [SceneStatus.ACTIVE, SceneStatus.INACTIVE],
        actions: [],
      });
    } catch (error) {
      console.log(error);
      return this.renderWithSidebar(res, "page/error", {
        layout: "/layouts/default-layout.ejs",
      });
    }
  };
  handleAutomaticSceneSavePage = async (req: Request, res: Response) => {
    try {
      const { name, status, group, logic, action, device, operator, value } =
        req.body as IAutomaticSceneSaveBodySchema;
      console.log(req.body);
      const condition = [];
      if (device.length > 0) {
        for (const item in device) {
          const deviceArr = device[item].split("|");
          condition.push({
            device: deviceArr[0],
            key: deviceArr[1],
            operator: operator[item],
            value: Number(value[item]),
          });
        }
      }

      const create = await AutomationScene.create({
        name,
        status,
        group,
        actions: action ? [action] : [],
        logic,
        conditions: condition,
      });
      console.log(create);
      if (create) {
        return res.redirect("/automatic/scene-create");
      }

      return this.renderWithSidebar(res, "page/error");
    } catch (error) {
      console.log(error);
      return this.renderWithSidebar(res, "page/error", {
        layout: "/layouts/default-layout.ejs",
      });
    }
  };
}
