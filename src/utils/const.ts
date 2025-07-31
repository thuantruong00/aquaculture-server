import z from "zod";
import { ComparisonOperator, LogicOperator, UserRole } from "./enum";
import { env } from "./env";

export const ComparisonOperatorLabelMap: Record<ComparisonOperator, string> = {
  [ComparisonOperator.LT]: "<",
  [ComparisonOperator.LTE]: "<=",
  [ComparisonOperator.GT]: ">",
  [ComparisonOperator.GTE]: ">=",
  [ComparisonOperator.EQ]: "==",
  [ComparisonOperator.NEQ]: "!=",
};

export const LogicOperatorLabelMap: Record<LogicOperator, string> = {
  [LogicOperator.AND]: "AND",
  [LogicOperator.OR]: "OR",
};

export const PagiOffset = 0;
export const PagiLimit = 50;
export const regexSecret = new RegExp(`^${env.ZONE_SECRET}[a-zA-Z0-9]{4}$`);

export const AllRoles = [
  UserRole.GUEST,
  UserRole.USER,
  UserRole.ADMIN,
  UserRole.ROOT,
];
export const IsUserGroup = [UserRole.USER, UserRole.ADMIN, UserRole.ROOT];

export const IsAdminGroup = [UserRole.USER, UserRole.ADMIN, UserRole.ROOT];
export const OtpExpireTimeInMs = 1000 * 60 * 60;
