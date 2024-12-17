const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  firstname: String,
  lastname: String,
  email: String,
  company: String,
  password: String,
  token: String,
  logoPath: String,
  avatarPath: String,
  // ObjectId
});

const User = mongoose.model("users", userSchema);

module.exports = User;
