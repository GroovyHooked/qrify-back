const mongoose = require("mongoose");

const customerSchema = mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  phoneNumber: String,
  customerId: String,
  userId: String,
});

const Customer = mongoose.model("customers", customerSchema);

module.exports = Customer;
