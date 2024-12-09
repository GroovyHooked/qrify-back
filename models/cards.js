const mongoose = require("mongoose");

const cardSchema = mongoose.Schema({
  path: String,
  totalValue: Number,
  customerId: String,
  cardId: String,
  userId: String,
  date: Date,
  recipient: String,
  remainingValue: Number,
});

const Card = mongoose.model("cards", cardSchema);

module.exports = Card;
