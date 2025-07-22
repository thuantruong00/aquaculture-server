import { ComparisonOperator, LogicOperator } from "./enum";

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
export const DeviceSecretKey = "maj12j31(@12zsd09";

export const PagiOffset = 0;
export const PagiLimit = 50;
