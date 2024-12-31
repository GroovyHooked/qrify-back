const mongoose = require("mongoose");

const customerSchema = mongoose.Schema({
  firstname: String,
  lastname: String,
  email: String,
  phoneNumber: String,
  userId: String,
});

const Customer = mongoose.model("customers", customerSchema);

module.exports = Customer;
