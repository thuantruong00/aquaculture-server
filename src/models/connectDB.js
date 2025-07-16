const { group } = require("console");
const { MongoClient, ObjectId } = require("mongodb");

const uri =
  process.env.MONGODB_CONNSTRING ||
  process.env.DEV_MONGODB_CONNSTRING ||
  "mongodb://localhost:27017/db01";

const client = new MongoClient(uri);
const dbName = process.env.DB_NAME || "db01";

async function insertDevice(id) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("device");
    const insertResult = await collection.insertOne(id);
    return {
      errCode: 0,
      insertResult,
    };
  } catch (err) {
    console.log(err);
  }

  client.close();
  return true;
}

async function insertHistoryEdit(data) {
  console.log(data);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("history_edit");
    const insertResult = await collection.updateOne(
      {
        valueOrder: data.valueOrder,
        idDevice: data.idDevice,
      },
      {
        $set: {
          valuePort1: data.valuePort1,
          valuePort2: data.valuePort2,
          timestamp: new Date().getTime(),
        },
      },
      { upsert: true }
    );
    return {
      errCode: 0,
      insertResult,
    };
  } catch (err) {
    console.log(err);
  }

  client.close();
  return true;
}

async function getNewRecordNormal(data) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("history_edit");
    const insertResult = await collection.findOne({
      idDevice: data.idDevice,
      valueOrder: data.order,
      // status: "normal",
    });
    return {
      errCode: 0,
      insertResult,
    };
  } catch (err) {
    console.log(err);
  }

  client.close();
  return true;
}

async function insertDataResearch(data) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("data_research");
    const insertResult = await collection.insertOne(data);
    return {
      errCode: 0,
      insertResult,
    };
  } catch (err) {
    console.log(err);
  }

  client.close();
  return true;
}

async function getDataResearch(data) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("data_research");
    const insertResult = await collection.find(data).toArray();
    return insertResult;
  } catch (err) {
    console.log(err);
  }

  client.close();
  return true;
}

async function insertTimer(data) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("timer");
    const insertResult = await collection.insertOne(data);
    return {
      errCode: 0,
      insertResult,
    };
  } catch (err) {
    console.log(err);
  }

  client.close();
  return true;
}

async function insertTemperature(data) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("temperature");
    const insertResult = await collection.updateOne(
      { id: 1 },
      { $set: { limitTemp: data } },
      { upsert: true }
    );
    return {
      errCode: 0,
      insertResult,
    };
  } catch (err) {
    console.log(err);
  }

  client.close();
  return true;
}

async function getTemperature() {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("temperature");
    const insertResult = await collection.findOne({ id: 1 });
    return insertResult?.limitTemp;
  } catch (err) {
    console.log(err);
  }
  client.close();
  return true;
}

async function getAllTimer() {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("timer");
    const insertResult = collection.find().toArray();
    return insertResult;
  } catch (err) {
    console.log(err);
  }
  client.close();
  return true;
}

async function changeStatusTimer(data) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("timer");
    const insertResult = await collection.updateOne(
      { _id: new ObjectId(data._id) },
      { $set: { status: data.status } },
      { upsert: false }
    );
    return {
      status: data.status,
      insertResult,
    };
  } catch (err) {
    console.log(err);
  }

  client.close();
  return true;
}

async function getAllTimerIsActive(hour) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("timer");
    const insertResult = collection
      .find({ status: "active", valueHour: { $eq: hour + "" } })
      .toArray();
    return insertResult;
  } catch (err) {
    console.log(err);
  }
  client.close();
  return true;
}

async function setInactiveTimer() {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("timer");
    const result = collection.updateMany({}, { $set: { status: "inactive" } });
    return result;
  } catch (err) {
    console.log(err);
  }
  client.close();
  return true;
}

async function deleteOneTimer(_id) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("timer");
    const result = collection.deleteOne({ _id });
    return result;
  } catch (err) {
    console.log(err);
  }
  client.close();
  return true;
}

async function insertPortOfDevice(array) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("port_of_device");
    const insertResult = await collection.insertMany(array);
    return insertResult;
  } catch (err) {
    console.log(err);
  }

  client.close();
  return true;
}

async function updatePortOfDevice(array) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("port_of_device");
    const insertResult = await collection.updateMany(array);
    return insertResult;
  } catch (err) {
    console.log(err);
  }

  client.close();
  return true;
}

async function updatePort(data) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("port_of_device");
    const insertResult = collection.updateOne(
      { _id: new ObjectId(data.id) },
      {
        $set: {
          port1: data.port1,
          port2: data.port2,
        },
      }
    );

    return insertResult;
  } catch (err) {
    console.log(err);
  }
  client.close();
  return true;
}

async function updatePortByPortNumber(data) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("port_of_device");
    const insertResult = collection.updateOne(
      { order: Number(data.order), idPort: data.idPort },
      {
        $set: {
          name: data.name,
          isActive: data.isActive,
          colorPort1: data.colorPort1,
          colorPort2: data.colorPort2,
          group: data.group,
        },
      }
    );

    return insertResult;
  } catch (err) {
    console.log(err);
  }
  client.close();
  return true;
}

async function updateBrightnessByPortNumber(data) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("port_of_device");
    const insertResult = collection.updateOne(
      { order: Number(data.valueOrder), idPort: data.idDevice },
      {
        $set: {
          port1: data.valuePort1,
          port2: data.valuePort2,
          isActive: data.isActive,
        },
      }
    );

    return insertResult;
  } catch (err) {
    console.log(err);
  }
  client.close();
  return true;
}

async function getAllDevice() {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("device");
    const insertResult = collection.find().toArray();
    return insertResult;
  } catch (err) {
    console.log(err);
  }
  client.close();
  return true;
}

async function getAllPort() {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("port_of_device");
    let insertResult = await collection.find({}).toArray();
    let array = [];

    for (let item of insertResult) {
      const a = await db.collection("device").findOne({
        _id: new ObjectId(item.idDevice),
      });
      item = { ...a, ...item };
      array.push(item);
    }

    return array;
  } catch (err) {
    console.log(err);
  }
  client.close();
}

async function getAllTemp(data) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("device");
    let insertResult = await collection
      .find({ type: "temperature", idDevice: { $ne: data.idDevice } })
      .toArray();
    return insertResult;
  } catch (err) {
    console.log(err);
  }
  client.close();
}

async function updateInfoTemp(data) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("device");
    const insertResult = collection.updateOne(
      { idDevice: data.idDevice },
      {
        $set: {
          name: data.name,
          group: data.group,
        },
      }
    );

    return insertResult;
  } catch (err) {
    console.log(err);
  }
  client.close();
  return true;
}

async function updateIndexTemp(data) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("device");
    const insertResult = collection.updateOne(
      { idDevice: data.idDevice },
      {
        $set: {
          valueTemperature: data.temperature,
          valueHumidity: data.humidity,
          valuePH: data.pH,
          valueTds: data.TDS,
          valueNitro: data.nitro,
          valuePhos: data.phos,
          valuePota: data.pota,
        },
      },
      {
        upsert: true,
      }
    );

    return insertResult;
  } catch (err) {
    console.log(err);
  }
  client.close();
  return true;
}

async function getAllPortIsActive() {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("port_of_device");
    let insertResult = await collection.find({ isActive: "true" }).toArray();
    // let array = [];

    // for (let item of insertResult) {
    //   const a = await db.collection("device").findOne({
    //     _id: new ObjectId(item.idDevice),
    //   });
    //   item = { ...a, ...item };
    //   array.push(item);
    // }

    return insertResult;
  } catch (err) {
    console.log(err);
  }
  client.close();
}

async function getAllPortByID(id) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("port_of_device");
    let insertResult = await collection.find({ idPort: id }).toArray();
    let array = [];

    for (let item of insertResult) {
      const a = await db.collection("device").findOne({
        _id: new ObjectId(item.idDevice),
      });
      item = { ...a, ...item };
      array.push(item);
    }

    return array;
  } catch (err) {
    console.log(err);
  }
  client.close();
}

async function findDevice(id) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("device");
    const insertResult = await collection.findOne({ _id: new ObjectId(id) });
    return insertResult;
  } catch (err) {
    console.log(err);
  }
  client.close();
  return true;
}

async function findDeviceByID(idDevice) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("device");
    const insertResult = await collection
      .find({
        idDevice,
      })
      .toArray();
    return insertResult;
  } catch (err) {
    console.log(err);
  }
  client.close();
  return true;
}

async function filterHistory(data) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("history_edit");
    const insertResult = collection.find(data).toArray();
    return insertResult;
  } catch (err) {
    console.log(err);
  }
  client.close();
  return true;
}

module.exports = {
  insertDevice,
  getAllPort,
  getAllDevice,
  insertPortOfDevice,
  updatePort,
  findDevice,
  updatePortOfDevice,
  updatePortByPortNumber,
  getAllPortByID,
  findDeviceByID,
  getAllPortIsActive,
  insertHistoryEdit,
  filterHistory,
  insertTimer,
  getAllTimer,
  deleteOneTimer,
  getAllTimerIsActive,
  updateBrightnessByPortNumber,
  insertTemperature,
  getTemperature,
  getAllTemp,
  updateIndexTemp,
  updateInfoTemp,
  setInactiveTimer,
  changeStatusTimer,
  getNewRecordNormal,
  insertDataResearch,
  getDataResearch,
};
