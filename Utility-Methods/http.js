const { MongoClient, FindCursor } = require("mongodb");
const uri = process.env.MONGO_URI;
var settings = {
  reconnectTries : Number.MAX_VALUE,
  autoReconnect : true
};
const client = new MongoClient(uri);
const db = "copit";


module.exports = class Data {
  async post(folder, data) {
    try {
      await client.connect();
      const res = await client.db(db).collection(folder).insertOne(data);
      return res;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    } finally {
      client.close();
    }
  }

  async get(folder, id) {
    try {
      await client.connect();
      const res = await client.db(db).collection(folder).findOne({ _id: id });
      if (res) {
        return res;
      }
    } catch (error) {
      console.log(error);
      throw new Error(error);
    } finally {
      client.close;
    }
  }

  async delete(folder, id) {
    try {
      await client.connect();
      const res = await client.db(db).collection(folder).deleteOne({ _id: id });
      if (res) {
        return res;
      }
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }
  async getAll(folder, query) {
    try {
      await client.connect();
      const res = await client.db(db).collection(folder).find(query).toArray();

      if (res) {
        return res;
      }
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  async put(folder, id, data) {
    try {
      await client.connect();
      const res = await client
        .db(db)
        .collection(folder)
        .updateOne({ _id: id }, { $set: data });
      if (res) {
        return res;
      }
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }
};
