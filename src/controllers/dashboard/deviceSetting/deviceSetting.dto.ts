import { Type } from "class-transformer";
import {
  IsEnum,
  IsString,
  Length,
  IsOptional,
  IsBoolean,
  IsMongoId,
  IsNumber,
  Min,
  IsArray,
  ArrayNotEmpty,
  ValidateNested,
} from "class-validator";
import { DeviceStatus, DeviceType } from "~/utils/enum";

export class DeviceConnectDTO {
  @IsString()
  macValue!: string;

  @IsString()
  deviceModel!: string;

  @IsString()
  @Length(8, 64)
  secretKey!: string;
}
export type IDeviceConnectDTO = InstanceType<typeof DeviceConnectDTO>;

export class ActivateDeviceDTO {
  @IsString()
  @Length(8, 64)
  deviceId!: string;

  @IsString()
  @Length(1, 64)
  deviceName!: string;
}
export type IActivateDeviceDTO = InstanceType<typeof ActivateDeviceDTO>;

export class UpdateDeviceStatusDTO {
  @IsString()
  @Length(8, 64)
  deviceId!: string;

  @IsEnum(DeviceStatus)
  status!: string;
}
export type IUpdateDeviceStatusDTO = InstanceType<typeof UpdateDeviceStatusDTO>;

export class UpdateDeviceDTO {
  @IsOptional()
  @IsEnum(DeviceStatus)
  status?: DeviceStatus;

  @IsOptional()
  @IsString()
  @Length(1, 64)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(0, 256)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isOnline?: boolean;

  @IsOptional()
  @IsString()
  @Length(1, 128)
  manufactoryInfomation?: string;

  @IsOptional()
  @IsMongoId()
  deviceModel?: string;

  @IsOptional()
  @IsMongoId()
  group?: string;

  @IsOptional()
  @IsMongoId()
  zone?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;
}
export type IUpdateDeviceDTO = InstanceType<typeof UpdateDeviceDTO>;

export class UpdateDeviceGroupDTO {
  @IsString()
  @Length(8, 64)
  deviceId!: string;

  @IsString()
  @Length(8, 64)
  groupId!: string;
}
export type IUpdateDeviceGroupDTO = InstanceType<typeof UpdateDeviceGroupDTO>;

export class CreateDeviceModelDTO {
  @IsString()
  @Length(1, 64)
  name!: string;

  @IsOptional()
  @IsString()
  @Length(1, 64)
  description?: string;

  @IsOptional()
  @IsString()
  @Length(1, 64)
  template?: string;

  @IsArray()
  @IsEnum(DeviceType, { each: true })
  @ArrayNotEmpty()
  type?: DeviceType[];
}
export type ICreateDeviceModelDTO = InstanceType<typeof CreateDeviceModelDTO>;

export class DeviceOrderItemDTO {
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  index!: number;

  @IsString()
  deviceId!: string;
}
export class UpdateDeviceOrdersDTO {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => DeviceOrderItemDTO)
  order!: DeviceOrderItemDTO[];
}
export type IUpdateDeviceOrdersDTO = InstanceType<typeof UpdateDeviceOrdersDTO>;
