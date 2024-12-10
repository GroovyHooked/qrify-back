const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  firstname: String,
  lastname: String,
  email: String,
  company: String,
  password: String,
  token: String,
  userId: String,
  logoPath: String,
});

const User = mongoose.model("users", userSchema);

module.exports = User;
