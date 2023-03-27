require("dotenv").config;
const { MongoClient, FindCursor } = require("mongodb");
const uri = process.env.MONGO_URI;
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
};
