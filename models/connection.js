require('dotenv').config()
const mongoose = require("mongoose");

const connectionString = process.env.CONNECTION_STRING;

mongoose
  .connect(connectionString, { connectTimeoutMS: 10000 })
  .then(() => console.log("Database connected"))
  .catch((error) => console.error(error));
