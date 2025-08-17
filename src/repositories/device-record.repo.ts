// src/repositories/device-record.repository.ts

import { Types, PipelineStage } from "mongoose";

import { DeviceRecord } from "~/entities/device-record.entity"; // sửa path nếu cần
type AggRow = {
  t: string; // timestamp string (hour bucket)
  min?: number;
  max?: number;
  avg?: number;
  count?: number;
};
export class DeviceRecordRepository {
  static async getDeviceRecordMinMaxAvg(
    deviceId: string,
    key: string,
    date: string,
    bucket: number
  ) {
    const tz = process.env.TZ || "Asia/Ho_Chi_Minh";

    // tạo start và end theo ngày (ở VN timezone)
    const startLocal = new Date(`${date}T00:00:00+07:00`);
    const endLocal = new Date(`${date}T23:59:59.999+07:00`);

    const matchStage: any = {
      deviceId: new Types.ObjectId(deviceId),
      timestamp: { $gte: startLocal, $lt: endLocal },
    };
    const pipeline: PipelineStage[] = [
      { $match: matchStage },
      { $unwind: "$values" },
      { $match: { "values.key": key } },

      // convert value (replace comma with dot if needed)
      {
        $addFields: {
          _valueStr: {
            $convert: {
              input: "$values.value",
              to: "string",
              onError: null,
              onNull: null,
            },
          },
        },
      },
      {
        $addFields: {
          _valueStr2: {
            $cond: [
              { $ifNull: ["$_valueStr", false] },
              {
                $replaceAll: {
                  input: "$_valueStr",
                  find: ",",
                  replacement: ".",
                },
              },
              "$_valueStr",
            ],
          },
        },
      },
      {
        $addFields: {
          valueNumeric: {
            $convert: {
              input: "$_valueStr2",
              to: "double",
              onError: null,
              onNull: null,
            },
          },
        },
      },
      { $match: { valueNumeric: { $ne: null } } },

      // group by hour in VN timezone
      {
        $group: {
          _id: {
            // $dateToString: {
            //   format: "%Y-%m-%dT%H:00:00.000Z",
            //   date: "$timestamp",
            //   timezone: "Asia/Ho_Chi_Minh",
            // },
            $dateTrunc: {
              date: "$timestamp",
              unit: "minute", // truncate theo phút
              binSize: bucket, // số phút 1 bucket
              timezone: tz,
            },
          },
          min: { $min: "$valueNumeric" },
          max: { $max: "$valueNumeric" },
          avg: { $avg: "$valueNumeric" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          t: "$_id",
          min: { $round: ["$min", 3] },
          max: { $round: ["$max", 3] },
          avg: { $round: ["$avg", 3] },
          count: 1,
        },
      },
    ];

    const rows = await DeviceRecord.aggregate(pipeline)
      .allowDiskUse(true)
      .exec();
    return rows;
  }
  static async getDeviceRecordTimeSeries(
    deviceId: string,
    key: string,
    date: string,
    bucket: number
  ) {
    const getRows = await this.getDeviceRecordMinMaxAvg(
      deviceId,
      key,
      date,
      bucket
    );
    return toApexSeries(getRows, key);
  }
}

export function toApexSeries(rows: AggRow[], key: string) {
  // chuẩn hóa timestamp sang ms epoch (Apex cần số hoặc Date)
  const parseTs = (t: string) => new Date(t).getTime();

  // Tách ra các series (tùy có field nào)
  const minSeries = {
    name: `${key} Min`,
    data: rows.map((r) => [parseTs(r.t), r.min]),
  };
  const maxSeries = {
    name: `${key} Max`,
    data: rows.map((r) => [parseTs(r.t), r.max]),
  };
  const avgSeries = {
    name: `${key} Avg`,
    data: rows.map((r) => [parseTs(r.t), r.avg]),
  };

  // Trả về array để gắn vào ApexCharts
  return [minSeries, maxSeries, avgSeries];
}
