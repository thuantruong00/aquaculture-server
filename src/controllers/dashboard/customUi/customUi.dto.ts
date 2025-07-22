import {
  IsEnum,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from "class-validator";
import { Transform, Type } from "class-transformer";
import { PagiLimit, PagiOffset } from "~/utils/const";
import { DeviceGroupStatus } from "~/utils/enum";

export class CreateDeviceGroupDTO {
  @IsString()
  @Length(1, 64)
  groupName!: string;

  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsString()
  @Length(1, 64)
  groupDescription?: string;

  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsString()
  @Length(1, 64)
  template?: string;

  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsString()
  @Length(1, 64)
  zone?: string;
}
export type ICreateDeviceGroupDTO = InstanceType<typeof CreateDeviceGroupDTO>;

export class UpdateDeviceGroupInfoDTO {
  @IsString()
  @Length(1, 64)
  groupName!: string;

  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsString()
  @Length(1, 64)
  groupDescription?: string;

  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsString()
  @Length(1, 64)
  template?: string;

  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsString()
  @Length(1, 64)
  zoneId?: string;

  @IsOptional()
  @Type(() => Number) // Chuyển từ chuỗi sang số
  @IsNumber({}, { message: "Order phải là số" })
  @Min(0)
  @Max(30)
  order?: number;
}
export type IUpdateDeviceGroupInfoDTO = InstanceType<
  typeof UpdateDeviceGroupInfoDTO
>;

export class GetListDeviceGroupQueryDTO {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: "offset must be a number" })
  offset: number = PagiOffset;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: "limit must be a number" })
  limit: number = PagiLimit;

  @IsOptional()
  @IsEnum(DeviceGroupStatus)
  status: DeviceGroupStatus = DeviceGroupStatus.ACTIVE;
}
export type IGetListDeviceGroupQueryDTO = InstanceType<
  typeof GetListDeviceGroupQueryDTO
>;

export class GetGroupDetailParamsDTO {
  @IsString()
  @Length(1, 64)
  groupId!: string;
}
export type IGetGroupDetailParamsDTO = InstanceType<
  typeof GetGroupDetailParamsDTO
>;
