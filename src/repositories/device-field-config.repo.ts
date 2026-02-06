// src/repositories/device.repository.ts

import {
  DeviceFieldConfig,
  FieldAttrs,
  IDeviceFieldConfig,
  IDeviceFieldItem,
} from "~/entities/device-field-config.entity";

export class DeviceFieldConfigRepository {
  static findById = (id: string): Promise<IDeviceFieldConfig | null> =>
    DeviceFieldConfig.findById(id).exec();

  static createDeviceFieldConfig = async (params: {
    deviceId: string;
    name?: string;
    description?: string;
    fields: Array<{ key: string; attrs?: FieldAttrs }>;
  }): Promise<IDeviceFieldConfig> => {
    if (!params?.deviceId) {
      throw new Error("deviceId is required");
    }
    if (!params?.fields || params.fields.length === 0) {
      throw new Error("fields is required and must have at least one item");
    }

    const normalizedFields: IDeviceFieldItem[] = params.fields.map((item) => ({
      key: item.key,
      attrs: item.attrs ?? {},
    }));

    return await DeviceFieldConfig.create({
      name: params.name,
      description: params.description,
      device: params.deviceId,
      fields: normalizedFields,
    });
  };
}
