import { Request, Response } from "express";
import { BaseController } from "../dashboard.base-controller";
import { Device } from "~/entities/device.entity";
import {
  ActionStatus,
  ComparisonOperator,
  ComparisonOperatorSymbol,
  DeviceStatus,
  LogicOperator,
  LogicOperatorLabel,
  SceneStatus,
} from "~/utils/enum";
import {
  IActionUpdateBodySchema,
  IAutomaticSceneSaveBodySchema,
  IAutomaticSceneUpdateBodySchema,
} from "./automatic.dto";
import { AutomationScene } from "~/entities/automatic-scene.entity";
import { logger } from "~/utils/logger";
import { Action } from "~/entities/automatic-scene-action.entity";
import { ObjectId } from "typeorm";

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
      logger.error("Err handleAutomaticPage", error);
      return this.renderWithSidebar(res, "page/error", {
        layout: "/layouts/default-layout.ejs",
      });
    }
  };
  handleAutomaticActionPage = async (req: Request, res: Response) => {
    try {
      const findActions = await Action.find({
        status: { $ne: ActionStatus.DELETED },
      });
      this.renderWithSidebar(res, undefined, {
        actions: findActions,
      });
    } catch (error) {
      logger.error("Err handleAutomaticPage", error);
      return this.renderWithSidebar(res, "page/error", {
        layout: "/layouts/default-layout.ejs",
      });
    }
  };
  handleSceneDetailPage = async (req: Request, res: Response) => {
    try {
      const { sceneId } = req.params as unknown as any;
      this.renderWithSidebar(
        res,
        "page/dashboard/automatic-scene-detail.ejs",
        {}
      );
    } catch (error) {
      logger.error("Err handleAutomaticPage", error);
      return this.renderWithSidebar(res, "page/error", {
        layout: "/layouts/default-layout.ejs",
      });
    }
  };
  handleActionDetailPage = async (req: Request, res: Response) => {
    try {
      const { actionId } = req.params as unknown as any;
      this.renderWithSidebar(
        res,
        "page/dashboard/automatic-action-detail.ejs",
        {}
      );
    } catch (error) {
      logger.error("Err handleAutomaticPage", error);
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

      const findAction = await Action.find({
        status: { $eq: ActionStatus.ACTIVE },
      });

      this.renderWithSidebar(res, undefined, {
        comparisonOperators,
        logicOperator,
        devices: result,
        status: [SceneStatus.ACTIVE, SceneStatus.INACTIVE],
        actions: findAction,
      });
    } catch (error) {
      logger.error("Err handleAutomaticSceneCreatePage", error);
      return this.renderWithSidebar(res, "page/error", {
        layout: "/layouts/default-layout.ejs",
      });
    }
  };
  handleAutomaticSceneSavePage = async (req: Request, res: Response) => {
    try {
      const { name, status, group, logic, action, device, operator, value } =
        req.body as IAutomaticSceneSaveBodySchema;
      let actionId;
      if (!action) {
        const create = await Action.create({
          name: name,
          description: "Action. " + name,
        });
        if (create) {
          actionId = create._id;
        }
      } else {
        actionId = action;
      }
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
        actions: actionId ? [actionId] : [],
        logic,
        conditions: condition,
      });
      if (create && !action && actionId) {
        return res.redirect(`/automatic/action-detail/${actionId}`);
      }
      if (create) {
        return res.redirect("/automatic/scene-create");
      }

      return this.renderWithSidebar(res, "page/error");
    } catch (error) {
      logger.error("Err handleAutomaticSceneSavePage", error);
      return this.renderWithSidebar(res, "page/error", {
        layout: "/layouts/default-layout.ejs",
      });
    }
  };
  handleAutomaticSceneUpdatePage = async (req: Request, res: Response) => {
    try {
      const { sceneId } = req.params as unknown as any;
      const { name, status, group, logic, action, device, operator, value } =
        req.body as IAutomaticSceneUpdateBodySchema;
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

      const update = await AutomationScene.updateOne(
        { _id: sceneId },
        {
          name,
          status,
          group,
          actions: action ? [action] : [],
          logic,
          conditions: condition,
        }
      );

      if (update) {
        return res.redirect("/automatic");
      }

      return this.renderWithSidebar(res, "page/error");
    } catch (error) {
      logger.error("Err handleAutomaticSceneSavePage", error);
      return this.renderWithSidebar(res, "page/error", {
        layout: "/layouts/default-layout.ejs",
      });
    }
  };
  handleAutomaticSceneDeletePage = async (req: Request, res: Response) => {
    try {
      const { sceneId } = req.params as unknown as any;
      const update = await AutomationScene.updateOne(
        { _id: sceneId },
        {
          status: SceneStatus.DELETED,
        }
      );

      if (update) {
        return res.redirect("/automatic");
      }

      return this.renderWithSidebar(res, "page/error");
    } catch (error) {
      logger.error("Err handleAutomaticSceneSavePage", error);
      return this.renderWithSidebar(res, "page/error", {
        layout: "/layouts/default-layout.ejs",
      });
    }
  };
  handleAutomaticSceneDetailPage = async (req: Request, res: Response) => {
    try {
      const { sceneId } = req.params as unknown as any;
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
              $literal: "device", // hoặc dùng EnumSource.device nếu đã import
            },
            deviceId: "$_id",
            key: "$deviceModel.fields.key",
            deviceType: "$deviceModel.fields.deviceType",
          },
        },
      ]);
      const findAction = await Action.find({
        status: { $eq: ActionStatus.ACTIVE },
      });
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
      const findScene = await AutomationScene.findOne({ _id: sceneId });
      if (findScene) {
        return this.renderWithSidebar(
          res,
          "page/dashboard/automatic-scene-detail.ejs",
          {
            comparisonOperators,
            logicOperator,
            devices: result,
            status: [SceneStatus.ACTIVE, SceneStatus.INACTIVE],
            scene: findScene,
            actions: findAction,
          }
        );
      }

      return this.renderWithSidebar(res, "page/error", {
        layout: "/layouts/default-layout.ejs",
      });
    } catch (error) {
      logger.error("Err handleAutomaticSceneCreatePage", error);
      return this.renderWithSidebar(res, "page/error", {
        layout: "/layouts/default-layout.ejs",
      });
    }
  };

  handleAutomaticActionDetailPage = async (req: Request, res: Response) => {
    try {
      const { actionId } = req.params as unknown as any;
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
          $project: {
            label: {
              $concat: ["$name", " - ", "$deviceModel.fields.label"],
            },
            source: {
              $literal: "device", // hoặc dùng EnumSource.device nếu đã import
            },
            deviceId: "$_id",
            key: "$deviceModel.fields.key",
            deviceType: "$deviceModel.fields.deviceType",
          },
        },
      ]);

      const findAction = await Action.findOne({ _id: actionId });
      if (findAction) {
        return this.renderWithSidebar(
          res,
          "page/dashboard/automatic-action-detail.ejs",
          {
            devices: result,
            status: [SceneStatus.ACTIVE, SceneStatus.INACTIVE],
            action: findAction,
          }
        );
      }
      return this.renderWithSidebar(res, "page/error", {
        layout: "/layouts/default-layout.ejs",
      });
    } catch (error) {
      logger.error("Err handleAutomaticSceneCreatePage", error);
      return this.renderWithSidebar(res, "page/error", {
        layout: "/layouts/default-layout.ejs",
      });
    }
  };
  handleAutomaticActionUpdatePage = async (req: Request, res: Response) => {
    try {
      const { actionId } = req.params as unknown as any;
      const { name, status, description, device, value } =
        req.body as IActionUpdateBodySchema;
      const findAction = await Action.findOne({ _id: actionId });
      const steps = [];
      if (device.length > 0) {
        for (const item in device) {
          const deviceArr = device[item].split("|");
          steps.push({
            deviceId: deviceArr[0],
            key: deviceArr[1],
            value: Number(value[item]),
          });
        }
      }
      console.log(steps);
      if (findAction) {
        const create = await Action.updateOne(
          { _id: actionId },
          {
            name,
            status,
            description,
            steps,
          }
        );
        // if (create && !action && actionId) {
        //   return res.redirect(`/automatic/action-detail/${actionId}`);
        // }
        if (create) {
          return res.redirect("/automatic/actions");
        }
      }

      return this.renderWithSidebar(res, "page/error");
    } catch (error) {
      logger.error("Err handleAutomaticSceneSavePage", error);
      return this.renderWithSidebar(res, "page/error", {
        layout: "/layouts/default-layout.ejs",
      });
    }
  };
}
