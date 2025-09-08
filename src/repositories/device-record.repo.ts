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
  static async getDeviceRecords(
    deviceId: string,
    key: string,
    date: string,
    offset: number,
    limit: number
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

      {
        $addFields: {
          _valueStr: {
            $toString: "$values.value", // convert any type to string (null -> "null")
          },
        },
      },
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
      // // 5. loại bỏ các giá trị không parse được
      { $sort: { timestamp: -1 } },

      // 7. pagination
      { $skip: offset },
      { $limit: limit },

      // 8. final projection
      {
        $project: {
          _id: 0,
          t: "$timestamp",
          value: "$valueNumeric",
          key: "$values.key",
        },
      },
    ];
    const rows = await DeviceRecord.aggregate(pipeline)
      .allowDiskUse(true)
      .exec();

    const countPipeline: PipelineStage[] = [
      { $match: matchStage },
      { $unwind: "$values" },
      { $match: { "values.key": key } },
      // normalize to string & trim
      {
        $addFields: {
          _valStr: { $trim: { input: { $toString: "$values.value" } } },
        },
      },
      // replace comma with dot if exists
      {
        $addFields: {
          _valStrNorm: {
            $cond: [
              { $gt: [{ $indexOfBytes: ["$_valStr", ","] }, -1] },
              {
                $replaceAll: { input: "$_valStr", find: ",", replacement: "." },
              },
              "$_valStr",
            ],
          },
        },
      },
      // convert to number (double)
      {
        $addFields: {
          valueNumeric: {
            $convert: {
              input: "$_valStrNorm",
              to: "double",
              onError: null,
              onNull: null,
            },
          },
        },
      },
      // keep only numeric
      { $match: { valueNumeric: { $ne: null } } },
      // final count
      { $count: "total" },
    ];
    const count = await DeviceRecord.aggregate(countPipeline)
      .allowDiskUse(true)
      .exec();
    const total =
      Array.isArray(count) && count.length ? (count[0].total ?? 0) : 0;
    const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;
    return { records: rows, total, offset, limit };
  }
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
  static async getDeviceRecordByDateAndKey(
    deviceId: string,
    key: string,
    date: string
  ) {
    const tz = process.env.TZ || "Asia/Ho_Chi_Minh";

    // tạo start và end theo ngày (VN timezone)
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

      // convert value về string
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
      // replace dấu phẩy thành dấu chấm
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
      // convert về số
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

      // chỉ lấy ra timestamp và valueNumeric
      {
        $project: {
          _id: 0,
          t: "$timestamp",
          value: "$valueNumeric",
        },
      },
      { $sort: { t: 1 } },
    ];

    const rows = await DeviceRecord.aggregate(pipeline)
      .allowDiskUse(true)
      .exec();

    return rows;
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
