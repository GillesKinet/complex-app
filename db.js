const { MongoClient } = require("mongodb");
require("dotenv").config();

const client = new MongoClient(
  `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PW}@cluster0.wpheb.mongodb.net/ToDoApp?retryWrites=true&w=majority&appName=Cluster0`
);

async function start() {
  await client.connect();
  module.exports = client.db(); // this allows us to work with the database from every file by requiring it in
  const app = require("./app");
  app.listen(3000);
}

start();
