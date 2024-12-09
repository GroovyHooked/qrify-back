const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  compagny: String,
  password: String,
  token: String,
  userId: String,
  logoPath: String,
});

const User = mongoose.model("users", userSchema);

module.exports = User;
