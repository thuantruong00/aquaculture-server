// src/repositories/device.repository.ts

import { Types, PipelineStage } from "mongoose";
import { ExecutionLog } from "~/entities/execution-log.entity";

/**
 * Kiểu trả về cho mỗi bucket (dùng chung cho avg / min / max)
 */
export type SeriesPoint = {
  t: Date;
  value: number | null; // avg / min / max theo context
  count: number;
};

/**
 * Kiểu hàng trả về từ aggregation trước khi fill missing buckets
 * - AggAvgRow: khi dùng avg (có thể có min/max nữa)
 * - AggValueRow: khi dùng min/max (trả field "value")
 */
type AggAvgRow = {
  t: Date | string;
  avg: number;
  min?: number;
  max?: number;
  count: number;
};
type AggValueRow = {
  t: Date | string;
  value: number;
  count: number;
};

export class ExecutionLogRepository {
  /**
   * Lấy trung bình theo bucket trong ngày (trả SeriesPoint.value = avg)
   */
  static async getDailyAvgSeries(
    deviceId: string,
    key: string,
    date: Date | string,
    bucketMinutes = 15
  ): Promise<SeriesPoint[]> {
    const { start, end } = normalizeDayRange(date);
    
    const pipeline: PipelineStage[] = [
      {
        $match: {
          deviceId: new Types.ObjectId(deviceId),
          executedAt: { $gte: start, $lt: end },
        },
      },
      { $unwind: "$values" },
      { $match: { "values.key": key } },
      {
        $addFields: {
          valueNumeric: {
            $convert: {
              input: "$values.value",
              to: "double",
              onError: null,
              onNull: null,
            },
          },
        },
      },
      { $match: { valueNumeric: { $ne: null } } },
      {
        $group: {
          _id: {
            $dateTrunc: {
              date: "$executedAt",
              unit: "minute",
              binSize: bucketMinutes,
            },
          },
          avg: { $avg: "$valueNumeric" },
          min: { $min: "$valueNumeric" },
          max: { $max: "$valueNumeric" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          t: "$_id",
          avg: { $round: ["$avg", 3] },
          min: 1,
          max: 1,
          count: 1,
        },
      },
    ];

    // annotate result type để TypeScript hiểu cấu trúc rows
    const rows = await ExecutionLog.aggregate<AggAvgRow>(
      pipeline as PipelineStage[]
    )
      .allowDiskUse(true)
      .exec();
    console.log(rows);
    // chuyển thành SeriesPoint[] với value = avg
    const points = fillMissingBuckets(start, end, bucketMinutes, rows, "avg");
    return points;
  }

  /**
   * Hàm chung lấy extreme (max|min) theo bucket
   * operator: "$max" | "$min"
   */
  static async getDailyExtremeSeries(
    deviceId: string,
    key: string,
    date: Date | string,
    bucketMinutes = 15,
    operator: "$max" | "$min"
  ): Promise<SeriesPoint[]> {
    const { start, end } = normalizeDayRange(date);

    const pipeline: PipelineStage[] = [
      {
        $match: {
          deviceId: new Types.ObjectId(deviceId),
          executedAt: { $gte: start, $lt: end },
        },
      },
      { $unwind: "$values" },
      { $match: { "values.key": key } },
      {
        $addFields: {
          valueNumeric: {
            $convert: {
              input: "$values.value",
              to: "double",
              onError: null,
              onNull: null,
            },
          },
        },
      },
      { $match: { valueNumeric: { $ne: null } } },
      {
        $group: {
          _id: {
            $dateTrunc: {
              date: "$executedAt",
              unit: "minute",
              binSize: bucketMinutes,
            },
          },
          // trường "value" dùng dynamic operator
          value: { [operator]: "$valueNumeric" } as any,
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          t: "$_id",
          value: { $round: ["$value", 3] },
          count: 1,
        },
      },
    ];

    const rows = await ExecutionLog.aggregate<AggValueRow>(
      pipeline as PipelineStage[]
    )
      .allowDiskUse(true)
      .exec();

    return fillMissingBuckets(start, end, bucketMinutes, rows, "value");
  }

  /** Public helpers */
  static async getDailyMaxSeries(
    deviceId: string,
    key: string,
    date: Date | string,
    bucketMinutes = 15
  ): Promise<SeriesPoint[]> {
    return this.getDailyExtremeSeries(
      deviceId,
      key,
      date,
      bucketMinutes,
      "$max"
    );
  }

  static async getDailyMinSeries(
    deviceId: string,
    key: string,
    date: Date | string,
    bucketMinutes = 15
  ): Promise<SeriesPoint[]> {
    return this.getDailyExtremeSeries(
      deviceId,
      key,
      date,
      bucketMinutes,
      "$min"
    );
  }
}

/**
 * Fill missing buckets (hỗ trợ rows có fieldName = 'avg' hoặc 'value')
 * rows: mảng AggAvgRow | AggValueRow
 * fieldName: 'avg' | 'value' - tên trường trong rows chứa giá trị cần lấy
 */
function fillMissingBuckets(
  start: Date,
  end: Date,
  bucketMinutes: number,
  rows: (AggAvgRow | AggValueRow)[],
  fieldName: "avg" | "value"
): SeriesPoint[] {
  // map key = millisecond timestamp (number)
  const map = new Map<number, (typeof rows)[0]>();
  for (const r of rows) {
    const millis = new Date((r as any).t).getTime();
    map.set(millis, r);
  }

  const res: SeriesPoint[] = [];
  const cur = new Date(start);
  while (cur < end) {
    const key = cur.getTime();
    if (map.has(key)) {
      const r = map.get(key)! as any;
      const val = r[fieldName] ?? null;
      res.push({
        t: new Date(key),
        value: val === undefined ? null : val,
        count: r.count ?? 0,
      });
    } else {
      res.push({ t: new Date(key), value: null, count: 0 });
    }
    cur.setMinutes(cur.getMinutes() + bucketMinutes);
  }

  return res;
}

/** Helper: normalize start/end of day from a given date */
function normalizeDayRange(date: Date | string) {
  const d = new Date(date);
  const start = new Date(d);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 1);
  return { start, end };
}
