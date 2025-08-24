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
  RepeatUnit,
  SceneStatus,
} from "~/utils/enum";
import {
  IActionUpdateBodySchema,
  IAutomaticSceneSaveBodySchema,
  IAutomaticSceneUpdateBodySchema,
  ITimerCreateBodySchema,
} from "./automatic.dto";
import { AutomationScene } from "~/entities/automatic-scene.entity";
import { logger } from "~/utils/logger";
import { Action } from "~/entities/automatic-scene-action.entity";
import { ObjectId } from "typeorm";
import { TimerJob } from "~/entities/timer-job.entity";
import is from "zod/v4/locales/is.cjs";
import { addJob, listJobs, removeJob } from "~/services";
import { IDeviceModel } from "~/entities/device-model.entity";
import { NotificationOption } from "~/entities/notification-option.entity";
import { randomString } from "~/utils/mqtt";

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
  handleAutomaticCreateActionPage = async (req: Request, res: Response) => {
    try {
      const random = randomString(4, { lower: false, upper: false });
      const createAction = await Action.create({
        name: "Hành động " + random,
        description: "Hành động . " + random,
      });

      if (createAction) {
        return res.redirect(`/dashboard/automatic/action-detail/${createAction._id}`);
      }

      return this.renderWithSidebar(res, "page/error");
    } catch (error) {
      logger.error("Err handleAutomaticSceneSavePage", error);
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
      const findNotiGroup = await NotificationOption.find({});
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
        notiGroup: findNotiGroup,
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
      let actionId: any;
      if (action === "createAction") {
        actionId = await Action.create({
          name,
          description: "Action. " + name,
        });
      } else {
        actionId = await Action.findOne({ _id: action });
      }

      if (!actionId) return this.renderWithSidebar(res, "page/error");

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
        actions: actionId ? [actionId._id] : [],
        logic,
        conditions: condition,
      });
      if (create && action == "createAction" && actionId) {
        return res.redirect(`/dashboard/automatic/action-detail/${actionId._id}`);
      }
      if (create) {
        return res.redirect("/dashboard/automatic/scene-create");
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
      const {
        name,
        status,
        group,
        logic,
        action,
        device,
        operator,
        value,
        notiGroup,
      } = req.body as IAutomaticSceneUpdateBodySchema;
      let notiGroupValue = notiGroup == "none" ? null : notiGroup;
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
          notifications: notiGroup,
        }
      );

      if (update) {
        return res.redirect("/dashboard/automatic");
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
        return res.redirect("/dashboard/automatic");
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
      const findNotiGroup = await NotificationOption.find({});
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
      const findScene = await AutomationScene.findOne({
        _id: sceneId,
      }).populate("actions");
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
            notiGroup: findNotiGroup,
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
          const findDevice = await Device.findOne({
            _id: deviceArr[0],
          }).populate("deviceModel");

          if (findDevice && findDevice.deviceModel) {
            const deviceModel =
              findDevice.deviceModel as unknown as IDeviceModel;
            steps.push({
              deviceId: deviceArr[0],
              key: deviceArr[1],
              value: Number(value[item]),
              deviceType: deviceModel.fields.find(
                (item) => item.key == deviceArr[1]
              )?.deviceType,
            });
          }
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
          return res.redirect("/dashboard/automatic/actions");
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
  handleAutomaticActionDeletePage = async (req: Request, res: Response) => {
    try {
      const { actionId } = req.params as unknown as any;

      const findAction = await Action.findOne({ _id: actionId });

      if (findAction) {
        const findActionInScene = await AutomationScene.find({
          status: { $ne: SceneStatus.DELETED },
          actions: { $in: [actionId] },
        });
        if (findActionInScene.length < 1) {
          const deleteAction = await Action.updateOne(
            { _id: actionId },
            { status: ActionStatus.DELETED }
          );
          if (deleteAction) {
            return res.redirect("/dashboard/automatic/actions");
          }
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
  handleAutomaticTimerPage = async (req: Request, res: Response) => {
    try {
      const findAction = await Action.find({
        status: { $eq: ActionStatus.ACTIVE },
      });
      const findTimerJobs = await TimerJob.find({
        status: { $ne: ActionStatus.DELETED },
      });
      const getJob = listJobs().map((item) => item.id);
      console.log(getJob);
      this.renderWithSidebar(res, undefined, {
        actions: findAction,
        timerJobs: findTimerJobs || [],
        listJobs: getJob,
      });
    } catch (error) {
      logger.error("Err handleAutomaticPage", error);
      return this.renderWithSidebar(res, "page/error", {
        layout: "/layouts/default-layout.ejs",
      });
    }
  };
  handleAutomaticTimerCreatePage = async (req: Request, res: Response) => {
    try {
      const {
        name,
        action,
        runHour,
        runMinute,
        repeatInterval,
        isRepeating,
        repeatUnit,
      } = req.body as unknown as ITimerCreateBodySchema;

      const schedule = toCronExpression(
        isRepeating,
        runHour,
        runMinute,
        repeatInterval,
        repeatUnit
      );
      let actionId: any;
      if (action === "createAction") {
        actionId = await Action.create({
          name,
          description: "Action. " + name,
        });
      } else {
        actionId = await Action.findOne({ _id: action });
      }
      if (!actionId) return this.renderWithSidebar(res, "page/error");
      if (schedule) {
        const createTimer = await TimerJob.create({
          name,
          action: actionId._id,
          runHour,
          runMinute,
          repeatInterval,
          isRepeating,
          repeatUnit,
          schedule,
        });
        if (createTimer) {
          addJob({
            id: String(createTimer._id),
            schedule: schedule,
            isRepeating: isRepeating,
            refTable: "action",
            refId: String(actionId._id),
          });
        }
        console.log(createTimer);
        if (createTimer && action === "createAction" && actionId) {
          return res.redirect(`/dashboard/automatic/action-detail/${actionId._id}`);
        }
        return res.redirect("/dashboard/automatic/timer");
      }

      return this.renderWithSidebar(res, "page/error");
    } catch (error) {
      logger.error("Err handleAutomaticSceneSavePage", error);
      return this.renderWithSidebar(res, "page/error", {
        layout: "/layouts/default-layout.ejs",
      });
    }
  };
  handleAutomaticTimerStart = async (req: Request, res: Response) => {
    try {
      const { timerJobId } = req.params as unknown as any;
      const findJob = await TimerJob.findOne({ _id: timerJobId }).populate(
        "action"
      );

      if (findJob) {
        const action = findJob.action;
        if (action) {
          addJob({
            id: String(findJob._id),
            schedule: findJob.schedule,
            isRepeating: findJob.isRepeating,
            refTable: "action",
            refId: String(action._id),
          });
          return res.redirect("/dashboard/automatic/timer");
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
  handleAutomaticTimerStop = async (req: Request, res: Response) => {
    try {
      const { timerJobId } = req.params as unknown as any;
      const findJob = await TimerJob.findOne({ _id: timerJobId }).populate(
        "action"
      );

      if (findJob) {
        const action = findJob.action;
        if (action) {
          removeJob(String(findJob._id));
          return res.redirect("/dashboard/automatic/timer");
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
  handleAutomaticTimerDeletePage = async (req: Request, res: Response) => {
    try {
      const { timerId } = req.params as unknown as any;
      const getList = listJobs().map((item) => item.id);
      if (getList.indexOf(timerId) < 0) {
        const update = await TimerJob.updateOne(
          { _id: timerId },
          {
            status: SceneStatus.DELETED,
          }
        );

        if (update) {
          return res.redirect("/dashboard/automatic/timer");
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

export function toCronExpression(
  isRepeating: boolean,
  runHour: number,
  runMinute: number,
  repeatInterval: number,
  repeatUnit: RepeatUnit
): string | null {
  console.log(isRepeating, repeatUnit, repeatUnit == RepeatUnit.DAY);
  if (isRepeating && repeatUnit == RepeatUnit.DAY) {
    const expression = `${runMinute} ${runHour} */${repeatInterval} * *`;
    return expression;
  }
  if (isRepeating && repeatUnit == RepeatUnit.HOUR) {
    const hours = [];
    for (let h = runHour; h < 24; h += 2) {
      hours.push(h);
    }
    const hourField = hours.join(",");
    return `${runMinute} ${hourField} * * *`;
  }
  if (isRepeating && repeatUnit == RepeatUnit.MINUTE) {
    const expressionArr: number[] = [];
    for (let i = 0; i < 60; i += repeatInterval) {
      expressionArr.push(i + runMinute);
    }
    const minuteField = expressionArr.join(",");
    const expression = `${minuteField} * * * *`;
    return expression;
  }
  if (!isRepeating) {
    const expression = `${runMinute} ${runHour} * * *`;
    return expression;
  }
  return null;
}
