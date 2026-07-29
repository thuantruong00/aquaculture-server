import { Document, Schema, model, Types } from "mongoose";
import {
  UserDeviceGroupPermissionAction,
  UserDeviceGroupPermissionStatus,
} from "~/utils/enum";

export interface IUserDeviceGroupPermission extends Document {
  userId: Types.ObjectId;
  deviceGroupId: Types.ObjectId;
  permissions: UserDeviceGroupPermissionAction[];
  status: UserDeviceGroupPermissionStatus;
  grantedBy?: Types.ObjectId | null;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserDeviceGroupPermissionSchema =
  new Schema<IUserDeviceGroupPermission>(
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },
      deviceGroupId: {
        type: Schema.Types.ObjectId,
        ref: "DeviceGroup",
        required: true,
        index: true,
      },
      permissions: {
        type: [String],
        enum: Object.values(UserDeviceGroupPermissionAction),
        default: [
          UserDeviceGroupPermissionAction.VIEW,
          UserDeviceGroupPermissionAction.CONTROL,
        ],
      },
      status: {
        type: String,
        enum: Object.values(UserDeviceGroupPermissionStatus),
        default: UserDeviceGroupPermissionStatus.ACTIVE,
        index: true,
      },
      grantedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: false,
        default: null,
      },
      description: {
        type: String,
        required: false,
      },
    },
    {
      timestamps: true,
    }
  );

UserDeviceGroupPermissionSchema.index(
  { userId: 1, deviceGroupId: 1 },
  { unique: true, name: "uniq_user_device_group_permission" }
);

export const UserDeviceGroupPermission = model<IUserDeviceGroupPermission>(
  "UserDeviceGroupPermission",
  UserDeviceGroupPermissionSchema
);
